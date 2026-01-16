import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import jsonwebtoken from 'jsonwebtoken';
import { randomUUID, randomBytes } from 'crypto';
import { UserService } from '../../../application/user-service';
import { CardService } from '../../../application/card-service';
import { FolderService } from '../../../application/folder-service';
import { defaultSetting } from '../../../config/app-config';

export function registerAuthRoutes(
    fastify: FastifyInstance,
    userService: UserService,
    cardService: CardService,
    folderService: FolderService
) {
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

            if (defaultSetting.createFolder) {
                try {
                    const folder = await folderService.createFolder(user.id, defaultSetting.folderName);
                    for (const cardData of [...defaultSetting.card]) {
                        await cardService.createCard(folder.id, cardData.question, cardData.answer);
                    }
                } catch (error) {
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
                });
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

            const password = randomBytes(16).toString('base64');
            const name = 'guest';

            const tempEmail = `temp-${randomUUID()}@kotcat.com`;
            let user = await userService.register(tempEmail, password, name, body.language, true);

            const guestEmail = `${user.id}@kotcat.com`;
            try {
                user = await userService.updateEmail(user.id, guestEmail);
            } catch (error) {
                if (error instanceof Error && error.message === 'Email already exists') {
                    return reply.code(409).send({ error: 'Email already exists' });
                }
                throw error;
            }

            if (defaultSetting.createFolder) {
                try {
                    const folder = await folderService.createFolder(user.id, defaultSetting.folderName);
                    for (const cardData of [...defaultSetting.card]) {
                        await cardService.createCard(folder.id, cardData.question, cardData.answer);
                    }
                } catch (error) {
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
                });
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
                security: [{ cookieAuth: [] }],
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
     * Получить JWT-токен по ID клиента и авторизационной куке
     */
    fastify.post('/auth/token',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['clientId'],
                    properties: {
                        clientId: { type: 'string', format: 'uuid' },
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
                summary: 'Issue JWT token by client ID and auth cookie',
            },
        },
        async (req, reply) => {
            const body = z
                .object({
                    clientId: z.string().uuid(),
                })
                .parse(req.body);

            const cookieToken = req.cookies?.token;
            if (!cookieToken) {
                return reply.code(401).send({ error: 'No auth cookie provided' });
            }

            try {
                const decoded = jsonwebtoken.verify(cookieToken, process.env.JWT_SECRET!) as { userId: string };
                const userIdFromToken = decoded.userId;

                if (userIdFromToken !== body.clientId) {
                    return reply.code(401).send({ error: 'Client ID does not match token' });
                }

                const user = await userService.getById(body.clientId);
                if (!user) {
                    return reply.code(401).send({ error: 'User not found' });
                }

                const token = jsonwebtoken.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

                return reply.send({ token });
            } catch (err) {
                return reply.code(401).send({ error: 'Invalid auth cookie' });
            }
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
}
