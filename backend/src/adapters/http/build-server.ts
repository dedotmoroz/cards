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

import { CreateCardDTO, CardDTO, UpdateCardDTO, CreateFolderDTO, FolderDTO } from './dto'

type CreateCardInput = z.infer<typeof CreateCardDTO>;

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
    fastify.decorate(
        'authenticate',
        async function (request: any, reply: any) {
            try {
                // await request.jwtVerify();
                await request.jwtVerify({ token: request.cookies.token });
            } catch (err) {
                reply.code(401).send({ message: 'Unauthorized' });
            }
        }
    );

    // ✅ Регистрируем CORS
    await fastify.register(cors, {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
        const { folderId, question, answer } = req.body;
        const card = await cardService.createCard(folderId, question, answer);
        return reply.code(201).send(card.toPublicDTO());
    });

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
                    },
                },
                response: {
                    201: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            email: { type: 'string', format: 'email' },
                        },
                    },
                },
                tags: ['auth'],
                summary: 'Register new user',
            },
        },
        async (req, reply) => {
            const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
            const user = await userService.register(body.email, body.password);
            return reply.code(201).send({ id: user.id, email: user.email });
        }
    );

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
                            createdAt: { type: 'string', format: 'date-time' },
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
            return reply.send({
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            });
        }
    );

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