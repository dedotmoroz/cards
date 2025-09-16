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

import { CardService } from '../../application/card-service';
import { FolderService } from '../../application/folder-service';
import { InMemoryCardRepository } from '../db/in-memory-card-repo';
import { PostgresCardRepository } from '../db/postgres-card-repo';
// import { InMemoryFolderRepository } from '../db/in-memory-folder-repo';
import { PostgresFolderRepository } from '../db/postgres-folder-repo';
import { CreateCardDTO, CardDTO, UpdateCardDTO, CreateFolderDTO, FolderDTO } from './dto'

type CreateCardInput = z.infer<typeof CreateCardDTO>;

export async function buildServer() {
    const fastify = Fastify({ logger: true });

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
        },
    });
    await fastify.register(fastifySwaggerUI, {
        routePrefix: '/docs',
    });

    // const cardRepo = new InMemoryCardRepository();
    const cardRepo = new PostgresCardRepository();
    const folderRepo = new PostgresFolderRepository();

    const cardService = new CardService(cardRepo);
    const folderService = new FolderService(folderRepo);

    /**
     * Создать Карточку
     */
    fastify.post('/cards',
        {
            schema: {
                body: zodToJsonSchema(CreateCardDTO),
                response: {
                    201: zodToJsonSchema(CardDTO)
                },
            }
        },
        async (
            req: FastifyRequest<{ Body: CreateCardInput }>,
            reply: FastifyReply
        ) => {
        const { folderId, question, answer } = req.body;
        const card = await cardService.createCard(folderId, question, answer);
        return reply.code(201).send(card);
    });

    /**
     * Отметить Карточку как изученную
     */
    fastify.patch('/cards/:id/learn-status',
        {
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
        return reply.code(200).send(updatedCard);
      }
    );

    /**
     * Переместить карточку в другую папку
     */
    fastify.patch('/cards/:id/move',
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
        return reply.send(updated);
      }
    );

    /**
     * Получить список Карточек из папки
     */
    fastify.get('/cards/folder/:folderId',
      {
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
        },
      },
      async (req: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) => {
        const cards = await cardService.getAll(req.params.folderId);
        return reply.send(cards);
      }
    );

    /**
     * Удалить карточку
     */
    fastify.delete('/cards/:id',
      {
        schema: {
          response: {
            200: {
              type: 'object',
              properties: {
                status: { type: 'string' },
              },
            },
          },
        },
      },
      async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
        await cardService.deleteCard(req.params.id);
        return reply.send({ status: 'ok' });
      }
    );

    /**
     * Создать Папку
     */
    fastify.post('/folders',
      {
        schema: {
          body: zodToJsonSchema(CreateFolderDTO),
          response: {
            201: zodToJsonSchema(FolderDTO),
          },
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

    return fastify;
}