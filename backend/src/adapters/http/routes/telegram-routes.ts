import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TelegramAuthService, InvalidOrExpiredNonceError } from '../../../application/telegram-auth-service';
import { ExternalAccountService } from '../../../application/external-account-service';
import { ExternalAccountAlreadyBoundError, UserAlreadyHasExternalAccountError } from '../../../domain/external-account';
import { FolderService } from '../../../application/folder-service';
import { UserService } from '../../../application/user-service';
import { GetNextContextCardsUseCase, ResetContextReadingUseCase } from '../../../application/context-reading-service';

export function registerTelegramRoutes(
    fastify: FastifyInstance,
    telegramAuthService: TelegramAuthService,
    externalAccountService: ExternalAccountService,
    userService: UserService,
    folderService: FolderService,
    getNextContextCardsUseCase: GetNextContextCardsUseCase,
    resetContextReadingUseCase: ResetContextReadingUseCase
) {
    /**
     * Авторизация через Telegram
     */
    fastify.post(
        '/telegram/auth/nonce',
        {
            preHandler: [fastify.authenticateService],
            schema: {
                body: {
                    type: 'object',
                    required: ['telegramUserId'],
                    properties: {
                        telegramUserId: { type: 'number' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            nonce: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Telegram nonce',
            },
        },
        async (request, reply) => {
            const { telegramUserId } = request.body as {
                telegramUserId: number;
            };

            const { nonce } =
                await telegramAuthService.createNonce(telegramUserId);

            reply.send({ nonce });
        }
    );

    /**
     * Привязка Telegram аккаунта к пользователю
     */
    fastify.post(
        '/telegram/auth/bind',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['nonce'],
                    properties: {
                        nonce: { type: 'string', minLength: 1 },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    409: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Bind Telegram account to user',
            },
        },
        async (
            req: FastifyRequest<{ Body: { nonce: string } }>,
            reply: FastifyReply
        ) => {
            const { nonce } = req.body;
            const userId = (req.user as any).userId;

            try {
                await telegramAuthService.bindByNonce({
                    nonce,
                    userId,
                });

                return reply.send({ ok: true });
            } catch (error) {
                if (error instanceof InvalidOrExpiredNonceError) {
                    return reply
                        .code(400)
                        .send({ message: 'Invalid or expired nonce' });
                }

                if (error instanceof ExternalAccountAlreadyBoundError) {
                    return reply
                        .code(409)
                        .send({ message: 'Telegram account already bound' });
                }

                if (error instanceof UserAlreadyHasExternalAccountError) {
                    return reply
                        .code(409)
                        .send({ message: 'User already has Telegram account bound' });
                }

                throw error;
            }
        }
    );

    /**
     * Информация о Telegram-привязке
     */
    fastify.get(
        '/telegram/me',
        {
            preHandler: [fastify.authenticateService],
            schema: {
                headers: {
                    type: 'object',
                    required: ['x-telegram-user-id'],
                    properties: {
                        'x-telegram-user-id': { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            linked: { type: 'boolean' },
                            userId: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Get Telegram account binding status',
            },
        },
        async (req, reply) => {
            const telegramUserIdRaw =
                req.headers['x-telegram-user-id'];

            const telegramUserId = String(telegramUserIdRaw);

            if (!telegramUserId) {
                return reply
                    .code(400)
                    .send({ message: 'Missing telegram user id' });
            }

            const externalAccount =
                await externalAccountService.findByProviderAndExternalId(
                    'telegram',
                    telegramUserId.toString()
                );

            if (!externalAccount) {
                return reply.send({ linked: false });
            }

            const user = await userService.getById(
                externalAccount.userId
            );

            if (!user) {
                return reply.send({ linked: false });
            }

            return reply.send({
                linked: true,
                userId: user.id,
                name: user.name ?? null,
            });
        }
    );

    /**
     * Получить папки пользователя по Telegram
     */
    fastify.get(
        '/telegram/folders',
        {
            preHandler: [fastify.authenticateService],
            schema: {
                headers: {
                    type: 'object',
                    required: ['x-telegram-user-id'],
                    properties: {
                        'x-telegram-user-id': { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                name: { type: 'string' },
                            },
                            required: ['id', 'name'],
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Get user folders by telegram account',
            },
        },
        async (request, reply) => {
            const telegramUserId = Number(
                request.headers['x-telegram-user-id']
            );

            if (!telegramUserId) {
                return reply.code(400).send({
                    message: 'Missing telegram user id',
                });
            }

            const account =
                await externalAccountService.findUserByTelegramUserId(
                    telegramUserId
                );

            if (!account) {
                return reply
                    .code(404)
                    .send({ message: 'Telegram account not linked' });
            }

            const folders =
                await folderService.getAll(account.userId);

            return reply.send(
                folders.map((f) => ({
                    id: f.id,
                    name: f.name,
                }))
            );
        }
    );

    /**
     * Контекстное обучение - получение карточек из Telegram
     */
    fastify.post(
        '/telegram/context/next',
        {
            preHandler: [fastify.authenticateService],
            schema: {
                body: {
                    type: 'object',
                    required: ['telegramUserId', 'folderId'],
                    properties: {
                        telegramUserId: { type: 'number' },
                        folderId: { type: 'string', format: 'uuid' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        required: ['text', 'translation', 'completed'],
                        properties: {
                            text: { type: 'string' },
                            translation: { type: 'string' },
                            completed: { type: 'boolean' },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Get next context text for Telegram user',
            },
        },
        async (
            req: FastifyRequest<{
                Body: {
                    telegramUserId: number;
                    folderId: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { telegramUserId, folderId } = req.body;

            const account =
                await externalAccountService.findUserByTelegramUserId(
                    telegramUserId
                );

            if (!account) {
                return reply.code(401).send({ message: 'Telegram not linked' });
            }

            const userId = account.userId;

            const result = await getNextContextCardsUseCase.execute({
                userId,
                folderId,
                limit: 3,
            });

            if (result.cards.length === 0) {
                return reply.send({
                    text: '',
                    translation: '',
                    completed: true,
                });
            }

            const text = result.cards
                .map(c => c.questionSentences)
                .filter(Boolean)
                .join('\n\n');

            const translation = result.cards
                .map(c => c.answerSentences)
                .filter(Boolean)
                .join('\n\n');

            return reply.send({
                text,
                translation,
                completed: result.completed,
            });
        }
    );

    /**
     * Контекстное обучение - сбросить прогресс контекстного чтения из Telegram
     */
    fastify.post(
        '/telegram/context-reading/reset',
        {
            preHandler: [fastify.authenticateService],
            schema: {
                headers: {
                    type: 'object',
                    required: ['x-telegram-user-id'],
                    properties: {
                        'x-telegram-user-id': { type: 'string' },
                    },
                },
                body: {
                    type: 'object',
                    required: ['folderId'],
                    properties: {
                        folderId: { type: 'string', format: 'uuid' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['telegram'],
                summary: 'Reset context reading state for folder',
            },
        },
        async (request, reply) => {
            const telegramUserId = Number(
                request.headers['x-telegram-user-id']
            );

            if (!telegramUserId) {
                return reply.code(400).send({
                    message: 'Missing telegram user id',
                });
            }

            const { folderId } = request.body as {
                folderId: string;
            };

            const account =
                await externalAccountService.findUserByTelegramUserId(
                    telegramUserId
                );

            if (!account) {
                return reply
                    .code(404)
                    .send({ message: 'Telegram account not linked' });
            }

            await resetContextReadingUseCase.execute({
                userId: account.userId,
                folderId,
            });

            return reply.send({ ok: true });
        }
    );
}
