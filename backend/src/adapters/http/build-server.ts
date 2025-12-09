/**
 * src/adapters/http/build-server.ts
 */

import Fastify from 'fastify';
import { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import jwt from '@fastify/jwt';
import * as dotenv from 'dotenv';
import cookie from '@fastify/cookie';
dotenv.config();

import { CardService } from '../../application/card-service';
import { FolderService } from '../../application/folder-service';
import { UserService } from '../../application/user-service';
import { PostgresCardRepository } from '../db/postgres-card-repo';
import { PostgresFolderRepository } from '../db/postgres-folder-repo';
import { PostgresUserRepository } from '../db/postgres-user-repo';
import { requestGeneration, fetchGenerationStatus } from '../ai/ai-service-client';

import { CreateCardDTO, CardDTO, UpdateCardDTO, CreateFolderDTO, FolderDTO } from './dto'
import { defaultSetting } from '../../config/app-config';
import { randomUUID, randomBytes } from 'crypto';

type CreateCardInput = z.infer<typeof CreateCardDTO>;

const CardGenerateRequestDTO = z
    .object({
        lang: z.string().optional(),
        level: z.string().optional(),
        count: z.number().int().positive().max(20).optional(),
        target: z.string().optional(),
        sample: z.string().optional(),
    })
    .describe('CardGenerateRequestDTO');
type CardGenerateRequestInput = z.infer<typeof CardGenerateRequestDTO>;

const CardGenerateStatusQueryDTO = z
    .object({
        jobId: z.string().min(1),
    })
    .describe('CardGenerateStatusQueryDTO');
type CardGenerateStatusQuery = z.infer<typeof CardGenerateStatusQueryDTO>;

export async function buildServer() {
    const fastify = Fastify({ logger: true });


    // ✅ Регистрируем cookie для http only
    await fastify.register(cookie);

    // ✅ JWT setup
    fastify.register(jwt, {
        secret: process.env.JWT_SECRET!,
        cookie: {
            cookieName: 'token', // откуда брать токен
            signed: false,
        },
    });

    // ✅ Декоратор для получения текущего пользователя
    // fastify.decorate(
    //     'authenticate',
    //     async function (request: any, reply: any) {
    //         try {
    //             // await request.jwtVerify();
    //             await request.jwtVerify({ token: request.cookies.token });
    //         } catch (err) {
    //             reply.code(401).send({ message: 'Unauthorized' });
    //         }
    //     }
    // );

    fastify.decorate(
        'authenticate',
        async function (request: any, reply: any) {
            try {
                let token: string | undefined;

                const authHeader = request.headers['authorization'] as string | undefined;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    token = authHeader.slice(7);
                } else if (request.cookies?.token) {
                    token = request.cookies.token;
                }

                if (!token) {
                    throw new Error('No token provided');
                }

                await request.jwtVerify({ token });
            } catch (err) {
                request.log.error({ err }, 'Auth failed');
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );

    // ✅ Регистрируем CORS
    // await fastify.register(cors, {
    //     origin: 'http://localhost:5173',
    //     credentials: true,
    //     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // });

    await fastify.register(cors, {
        origin: (origin, cb) => {
            // запросы без Origin (curl, прямой запрос) — разрешаем
            if (!origin) {
                return cb(null, true);
            }

            const allowedOrigins = [
                'http://localhost:5173', // твой фронт
                // сюда же потом добавишь прод, если будет
                // 'https://cards.yourdomain.com',
            ];

            // разрешаем фронт
            if (allowedOrigins.includes(origin)) {
                return cb(null, true);
            }

            // разрешаем расширения Chrome
            if (origin.startsWith('chrome-extension://')) {
                return cb(null, true);
            }

            // всё остальное — мимо
            return cb(new Error('Not allowed by CORS'), false);
        },
        credentials: true, // ВАЖНО: куки продолжают работать для SPA
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });


    // ✅ Подключаем Swagger
    await fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'Flashcards API',
                description: 'Документация для REST API',
                version: '1.0.0',
            },
            components: {
                securitySchemes: {
                    cookieAuth: {
                        type: 'apiKey',
                        in: 'cookie',
                        name: 'token', // имя cookie, в которой хранится JWT
                    },
                },
            },
            security: [
                {
                    cookieAuth: [],
                },
            ],
        },
    });

    // ✅ Swagger доступен /docs
    await fastify.register(fastifySwaggerUI, {
        routePrefix: '/docs',
    });

    const cardRepo = new PostgresCardRepository();
    const folderRepo = new PostgresFolderRepository();

    const cardService = new CardService(cardRepo);
    const folderService = new FolderService(folderRepo);

    const userRepo = new PostgresUserRepository();
    const userService = new UserService(userRepo);

    /**
     * Создать Карточку
     */
    fastify.post('/cards',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: zodToJsonSchema(CreateCardDTO),
                response: {
                    201: zodToJsonSchema(CardDTO)
                },
                tags: ['cards'],
                summary: 'Create a card',
            }
        },
        async (
            req: FastifyRequest<{ Body: CreateCardInput }>,
            reply: FastifyReply
        ) => {
        const { folderId, question, answer, questionSentences, answerSentences } = req.body;
        const card = await cardService.createCard(
            folderId,
            question,
            answer,
            questionSentences,
            answerSentences
        );
        return reply.code(201).send(card.toPublicDTO());
    });

    /**
     * Создать Карточку из браузерного расширения
     */
    fastify.post('/ext/cards',
        {
            preHandler: [fastify.authenticate], // тот же JWT, но из Authorization
            schema: {
                body: {
                    type: 'object',
                    required: ['word', 'folderId'],
                    properties: {
                        word: { type: 'string' },
                        folderId: { type: 'string', format: 'uuid' },
                        sourceUrl: { type: 'string' },
                        sentence: { type: 'string' },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            word: { type: 'string' },
                            folderId: { type: 'string', format: 'uuid' },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['extension'],
                summary: 'Add word from browser extension',
            },
            // Можно при желании задать отдельный CORS именно для этой ручки
            // preHandler: [fastify.cors({ origin: true }), fastify.authenticate],
        },
        async (
            req: FastifyRequest<{
                Body: {
                    word: string;
                    folderId: string;
                    sourceUrl?: string;
                    sentence?: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { word, folderId, sourceUrl, sentence } = req.body;
            const userId = (req.user as any).userId;

            // тут можно делать любые доп.проверки, например что folder принадлежит userId

            const question = word;
            const answer = ''; // расширение пока не знает перевода
            const questionSentences = sentence ? sentence : undefined;
            const answerSentences = undefined;

            const card = await cardService.createCard(
                folderId,
                question,
                answer,
                questionSentences,
                answerSentences
            );

            return reply.code(201).send({
                id: card.id,
                word,
                folderId,
            });
        }
    );

    /**
     * Отметить Карточку как изученную
     */
    fastify.patch('/cards/:id/learn-status',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['isLearned'],
                    properties: {
                        isLearned: { type: 'boolean' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                        },
                    },
                },
                tags: ['cards'],
                summary: 'Change card status',
            },
        },
        async (
            req: FastifyRequest<{ Params: { id: string }; Body: { isLearned: boolean } }>,
            reply: FastifyReply
        ) => {
            const { id } = req.params;
            const { isLearned } = req.body;

            if (isLearned) {
                await cardService.markAsLearned(id);
            } else {
                await cardService.markAsUnlearned(id);
            }
            return reply.send({ status: 'ok' });
        }
    );

    /**
     * Обновить Карточку
     */
    fastify.patch('/cards/:id',
      {
        preHandler: [fastify.authenticate],
        schema: {
          body: zodToJsonSchema(UpdateCardDTO),
          response: {
            200: zodToJsonSchema(CardDTO),
            404: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
            tags: ['cards'],
            summary: 'Edit card',
        },
      },
      async (
        req: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof UpdateCardDTO> }>,
        reply: FastifyReply
      ) => {
        const { id } = req.params;
        const updatedCard = await cardService.updateCard(id, req.body);
        if (!updatedCard) {
          return reply.code(404).send({ message: 'Card not found' });
        }
        return reply.code(200).send(updatedCard.toPublicDTO());
      }
    );

    /**
     * Переместить карточку в другую папку
     */
    fastify.patch('/cards/:id/move',
      {
        preHandler: [fastify.authenticate],
        schema: {
          params: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
            required: ['id'],
          },
          body: {
            type: 'object',
            properties: {
              folderId: { type: 'string', format: 'uuid' },
            },
            required: ['folderId'],
          },
          response: {
            200: zodToJsonSchema(CardDTO),
            404: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
            tags: ['cards'],
            summary: 'Move the card to another folder',
        },
      },
      async (
        req: FastifyRequest<{ Params: { id: string }; Body: { folderId: string } }>,
        reply: FastifyReply
      ) => {
        const { id } = req.params;
        const { folderId } = req.body;
        const updated = await cardService.moveCardToFolder(id, folderId);
        if (!updated) {
          return reply.code(404).send({ message: 'Card not found' });
        }
        return reply.send(updated.toPublicDTO());
      }
    );

    /**
     * Удалить карточку
     */
    fastify.delete('/cards/:id',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                        },
                    },
                },
                tags: ['cards'],
                summary: 'Delete card',
            },
        },
        async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            await cardService.deleteCard(req.params.id);
            return reply.send({ status: 'ok' });
        }
    );

    /**
     * Получить список Карточек из папки
     */
    fastify.get('/cards/folder/:folderId',
      {
        preHandler: [fastify.authenticate],
        schema: {
          params: {
            type: 'object',
            properties: {
              folderId: { type: 'string', format: 'uuid' },
            },
            required: ['folderId'],
          },
          response: {
            200: {
              type: 'array',
              items: zodToJsonSchema(CardDTO),
            },
          },
            tags: ['cards'],
            summary: 'Get the list of cards from the folder',
        },
      },
      async (req: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) => {
        const cards = await cardService.getAll(req.params.folderId);
        return reply.send(cards.map(card => card.toPublicDTO()));
      }
    );

    /**
     * Запустить генерацию предложений для карточки
     */
    fastify.post('/cards/:id/generate',
        {
            preHandler: [fastify.authenticate],
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                    },
                    required: ['id'],
                },
                body: zodToJsonSchema(CardGenerateRequestDTO),
                response: {
                    202: {
                        type: 'object',
                        required: ['jobId'],
                        properties: {
                            jobId: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['AI'],
                summary: 'Generate AI sentences for a card',
            },
        },
        async (
            req: FastifyRequest<{
                Params: { id: string };
                Body: CardGenerateRequestInput | undefined;
            }>,
            reply: FastifyReply,
        ) => {
            const { id } = req.params;
            const card = await cardService.getById(id);
            if (!card) {
                return reply.code(404).send({ message: 'Card not found' });
            }

            const { lang, level, count, target, sample } = req.body ?? {};
            const userId = (req.user as any).userId;
            const user = await userService.getById(userId);

            const payload = {
                target: target ?? card.question,
                translationSample: sample ?? card.answer,
                lang: lang ?? 'en',
                count: count ?? 1,
                level: level ?? 'B1',
                translationLang: user?.language ?? 'en',
                userId,
                traceId: randomUUID(),
            };
            const { jobId } = await requestGeneration(payload);
            return reply.code(202).send({ jobId });
        },
    );

    /**
     * Проверить статус генерации предложений
     */
    fastify.get('/cards/:id/generate-status',
        {
            preHandler: [fastify.authenticate],
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                    },
                    required: ['id'],
                },
                querystring: zodToJsonSchema(CardGenerateStatusQueryDTO),
                response: {
                    200: {
                        type: 'object',
                        required: ['status'],
                        properties: {
                            status: {
                                type: 'string',
                                enum: ['waiting', 'active', 'completed', 'failed', 'delayed', 'paused'],
                            },
                            progress: { type: 'number' },
                            card: zodToJsonSchema(CardDTO),
                            error: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['AI'],
                summary: 'Get AI generation status for a card',
            },
        },
        async (
            req: FastifyRequest<{
                Params: { id: string };
                Querystring: CardGenerateStatusQuery;
            }>,
            reply: FastifyReply,
        ) => {
            const { id } = req.params;
            const { jobId } = req.query;

            const card = await cardService.getById(id);
            if (!card) {
                return reply.code(404).send({ message: 'Card not found' });
            }

            const status = await fetchGenerationStatus(jobId);
            const progress = typeof status.progress === 'number' ? status.progress : 0;

            if (status.state === 'failed') {
                return reply.send({
                    status: 'failed',
                    progress,
                    error: status.error ?? 'Generation failed',
                });
            }

            if (status.state === 'completed' && status.result) {
                const sentences = status.result.sentences ?? [];
                const questionSentences = sentences
                    .map((item) => item.text.trim())
                    .filter(Boolean)
                    .join('\n');
                const answerSentences = sentences
                    .map((item) => item.translation.trim())
                    .filter(Boolean)
                    .join('\n');

                const updatedCard = await cardService.updateCard(id, {
                    questionSentences: questionSentences.length ? questionSentences : null,
                    answerSentences: answerSentences.length ? answerSentences : null,
                });

                if (!updatedCard) {
                    return reply.code(404).send({ message: 'Card not found' });
                }

                return reply.send({
                    status: 'completed',
                    progress: 100,
                    card: updatedCard.toPublicDTO(),
                });
            }

            return reply.send({
                status: status.state,
                progress,
            });
        },
    );

    /**
     * Создать Папку
     */
    fastify.post('/folders',
      {
        preHandler: [fastify.authenticate],
        schema: {
          body: zodToJsonSchema(CreateFolderDTO),
          response: {
            201: zodToJsonSchema(FolderDTO),
          },
            tags: ['folders'],
            summary: 'Create a folder',
        },
      },
      async (
        req: FastifyRequest<{ Body: z.infer<typeof CreateFolderDTO> }>,
        reply: FastifyReply
      ) => {
        const { userId, name } = req.body;
        const folder = await folderService.createFolder(userId, name);
        return reply.code(201).send(folder);
      }
    );

    /**
     * Переименовать Папку
     */
    fastify.patch('/folders/:id',
        {
            preHandler: [fastify.authenticate],
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                    },
                    required: ['id'],
                },
                body: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                    },
                    required: ['name'],
                },
                response: {
                    200: zodToJsonSchema(FolderDTO),
                    404: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['folders'],
                summary: 'Rename folder',
            },
        },
        async (
            req: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>,
            reply: FastifyReply
        ) => {
            const { id } = req.params;
            const { name } = req.body;
            const updated = await folderService.renameFolder(id, name);
            if (!updated) {
                return reply.code(404).send({ message: 'Folder not found' });
            }
            return reply.send(updated);
        }
    );

    /**
     * Удалить Папку
     */
    fastify.delete('/folders/:id',
      {
        preHandler: [fastify.authenticate],
        schema: {
          params: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
            },
            required: ['id'],
          },
          response: {
            200: {
              type: 'object',
              properties: {
                status: { type: 'string' },
              },
            },
            404: {
              type: 'object',
              properties: {
                message: { type: 'string' },
              },
            },
          },
            tags: ['folders'],
            summary: 'Delete folder',
        },
      },
      async (
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
      ) => {
        const deleted = await folderService.deleteFolder(req.params.id);
        if (!deleted) {
          return reply.code(404).send({ message: 'Folder not found' });
        }
        return reply.send({ status: 'ok' });
      }
    );

    /**
     * Получить список Папок пользователя
     */
    fastify.get('/folders/:userId',
      {
        preHandler: [fastify.authenticate],
        schema: {
          params: {
            type: 'object',
            properties: {
              userId: { type: 'string', format: 'uuid' },
            },
            required: ['userId'],
          },
          response: {
            200: {
              type: 'array',
              items: zodToJsonSchema(FolderDTO),
            },
          },
            tags: ['folders'],
            summary: 'Get the list of folders',
        },
      },
      async (
        req: FastifyRequest<{ Params: { userId: string } }>,
        reply: FastifyReply
      ) => {
        const folders = await folderService.getAll(req.params.userId);
        return reply.send(folders);
      }
    );

    /**
     * Регистрация и аутентификация
     */
    fastify.post('/auth/register',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        name: { type: 'string' },
                        language: { type: 'string' },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            language: { type: 'string' },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Register new user',
            },
        },
        async (req, reply) => {
            const body = z.object({ 
                email: z.string().email(), 
                password: z.string().min(6),
                name: z.string().optional(),
                language: z.string().optional(),
            }).parse(req.body);
            const user = await userService.register(body.email, body.password, body.name, body.language, false);
            
            // Создаем дефолтную папку и карточки, если настроено
            if (defaultSetting.createFolder) {
                try {
                    const folder = await folderService.createFolder(user.id, defaultSetting.folderName);
                    for (const cardData of [...defaultSetting.card]) {
                        await cardService.createCard(folder.id, cardData.question, cardData.answer);
                    }
                } catch (error) {
                    // Логируем ошибку, но не прерываем регистрацию пользователя
                    console.error('Failed to create default folder and cards:', error);
                }
            }
            
            const token = await userService.login(body.email, body.password);
            if (!token) return reply.code(401).send({ error: 'Invalid credentials' });
            return reply
                .code(201)
                .setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7,
                })
                .send({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    language: user.language,
                })
        }
    );

    /**
     * Генерация гостевого аккаунта
     */
    fastify.post('/auth/guests',
        {
            schema: {
                body: {
                    type: 'object',
                    properties: {
                        language: { type: 'string' },
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            language: { type: 'string' },
                            isGuest: { type: 'boolean' },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    409: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Register guest user',
            },
        },
        async (req, reply) => {
            const body = z.object({ 
                language: z.string().optional(),
            }).parse(req.body);
            
            // Генерируем случайный пароль (16 байт в base64)
            const password = randomBytes(16).toString('base64');
            const name = 'guest';
            
            // Сначала создаем пользователя с временным email
            // Репозиторий сам генерирует UUID для id
            const tempEmail = `temp-${randomUUID()}@kotcat.com`;
            let user = await userService.register(tempEmail, password, name, body.language, true);
            
            // Обновляем email на id@kotcat.com
            const guestEmail = `${user.id}@kotcat.com`;
            try {
                user = await userService.updateEmail(user.id, guestEmail);
            } catch (error) {
                // Если email уже занят (крайне маловероятно для UUID), возвращаем ошибку
                if (error instanceof Error && error.message === 'Email already exists') {
                    return reply.code(409).send({ error: 'Email already exists' });
                }
                throw error;
            }
            
            // Создаем дефолтную папку и карточки, если настроено
            if (defaultSetting.createFolder) {
                try {
                    const folder = await folderService.createFolder(user.id, defaultSetting.folderName);
                    for (const cardData of [...defaultSetting.card]) {
                        await cardService.createCard(folder.id, cardData.question, cardData.answer);
                    }
                } catch (error) {
                    // Логируем ошибку, но не прерываем регистрацию пользователя
                    console.error('Failed to create default folder and cards:', error);
                }
            }
            
            const token = await userService.login(user.email, password);
            if (!token) return reply.code(401).send({ error: 'Invalid credentials' });
            return reply
                .code(201)
                .setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7,
                })
                .send({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    language: user.language,
                    isGuest: user.isGuest,
                })
        }
    );

    /**
     * login
     */
    fastify.post('/auth/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string', enum: ['ok'] },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Login user and set cookie',
            },
        },
        async (req, reply) => {
            const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
            const token = await userService.login(body.email, body.password);
            if (!token) return reply.code(401).send({ error: 'Invalid credentials' });

            return reply
                .setCookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 60 * 60 * 24 * 7,
                })
                .send({ status: 'ok' });
        }
    );

    /**
     * Информация о пользователе
     */
    fastify.get('/auth/me',
        {
            preHandler: [fastify.authenticate],
            schema: {
                security: [{ cookieAuth: [] }], // чтобы Swagger понял, что ручка защищена
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            language: { type: 'string' },
                            isGuest: { type: 'boolean' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Get current user by token',
            },
        },
        async (req, reply) => {
            const userId = (req.user as any).userId;
            const user = await userService.getById(userId);
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            const userName = (user.name && user.name.trim() !== '') ? user.name.trim() : null;
            return reply.send({
                id: user.id,
                email: user.email,
                name: userName,
                createdAt: user.createdAt,
                language: user.language ?? null,
                isGuest: user.isGuest ?? false,
            });
        }
    );

    /**
     * Профайл пользователя
     */
    fastify.patch('/auth/profile',
        {
            preHandler: [fastify.authenticate],
            schema: {
                security: [{ cookieAuth: [] }],
                body: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Update user profile name',
            },
        },
        async (req, reply) => {
            const userId = (req.user as any).userId;
            const body = z.object({ 
                name: z.string(),
            }).parse(req.body);
            
            try {
                const user = await userService.updateName(userId, body.name);
                return reply.send({ name: user.name });
            } catch (error) {
                return reply.code(404).send({ error: 'User not found' });
            }
        }
    );

    /**
     * Смена пароля
     */
    fastify.patch('/auth/password',
        {
            preHandler: [fastify.authenticate],
            schema: {
                security: [{ cookieAuth: [] }],
                body: {
                    type: 'object',
                    required: ['oldPassword', 'newPassword'],
                    properties: {
                        oldPassword: { type: 'string' },
                        newPassword: { type: 'string', minLength: 6 },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            status: { type: 'string' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Change user password',
            },
        },
        async (req, reply) => {
            const userId = (req.user as any).userId;
            const body = z.object({ 
                oldPassword: z.string(),
                newPassword: z.string().min(6),
            }).parse(req.body);
            
            try {
                await userService.changePassword(userId, body.oldPassword, body.newPassword);
                return reply.send({ status: 'ok' });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Invalid old password') {
                        return reply.code(400).send({ error: 'Invalid old password' });
                    }
                    if (error.message === 'User not found') {
                        return reply.code(404).send({ error: 'User not found' });
                    }
                }
                return reply.code(400).send({ error: 'Failed to change password' });
            }
        }
    );

    /**
     * Смена языка интерфейса
     */
    fastify.patch('/auth/language',
        {
            preHandler: [fastify.authenticate],
            schema: {
                security: [{ cookieAuth: [] }],
                body: {
                    type: 'object',
                    required: ['language'],
                    properties: {
                        language: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            language: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Update user language',
            },
        },
        async (req, reply) => {
            const userId = (req.user as any).userId;
            const body = z.object({ 
                language: z.string(),
            }).parse(req.body);
            
            try {
                const user = await userService.updateLanguage(userId, body.language);
                return reply.send({ language: user.language });
            } catch (error) {
                return reply.code(404).send({ error: 'User not found' });
            }
        }
    );

    /**
     * Перевод гостевого пользователя в постоянные
     */
    fastify.patch('/auth/guests/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                    },
                    required: ['id'],
                },
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        name: { type: 'string' },
                        language: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            email: { type: 'string', format: 'email' },
                            name: { type: 'string' },
                            language: { type: 'string' },
                            isGuest: { type: 'boolean' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    404: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                    409: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Convert guest user to regular user',
            },
        },
        async (req, reply) => {
            const { id } = req.params as { id: string };
            const body = z.object({ 
                email: z.string().email(),
                password: z.string().min(6),
                name: z.string().optional(),
                language: z.string().optional(),
            }).parse(req.body);
            
            try {
                const user = await userService.convertGuestToUser(
                    id,
                    body.email,
                    body.password,
                    body.name,
                    body.language
                );
                
                return reply.send({
                    email: user.email,
                    name: user.name,
                    language: user.language,
                    isGuest: user.isGuest,
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'User not found') {
                        return reply.code(404).send({ error: 'User not found' });
                    }
                    if (error.message === 'User is not a guest') {
                        return reply.code(400).send({ error: 'User is not a guest' });
                    }
                    if (error.message === 'Email already exists') {
                        return reply.code(409).send({ error: 'Email already exists' });
                    }
                }
                return reply.code(400).send({ error: 'Failed to convert guest to user' });
            }
        }
    );

    /**
     * Получить JWT-токен по логину/паролю (для расширения и внешних клиентов)
     */
    fastify.post('/auth/token',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                    401: {
                        type: 'object',
                        properties: {
                            error: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Issue JWT token for API clients (no cookies)',
            },
        },
        async (req, reply) => {
            const body = z
                .object({
                    email: z.string().email(),
                    password: z.string(),
                })
                .parse(req.body);

            const token = await userService.login(body.email, body.password);
            if (!token) {
                return reply.code(401).send({ error: 'Invalid credentials' });
            }

            // ВАЖНО: без setCookie — просто отдаем токен
            return reply.send({ token });
        }
    );

    /**
     * Выход
     */
    fastify.post('/auth/logout',
        {
            schema: {
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Clear auth cookie',
            },
        },
        async (req, reply) => {
            reply.clearCookie('token', { path: '/' }).send({ ok: true });
        }
    );

    fastify.post('/auth/google',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['idToken'],
                    properties: {
                        idToken: { type: 'string' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            token: { type: 'string' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Login via Google',
            },
        },
        async (req, reply) => {
            const body = z.object({ idToken: z.string() }).parse(req.body);
            const token = await userService.loginWithGoogle(body.idToken);
            return reply.send({ token });
        }
    );

    return fastify;
}