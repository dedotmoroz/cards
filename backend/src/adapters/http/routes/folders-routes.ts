import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FolderService } from '../../../application/folder-service';
import { CreateFolderDTO, FolderDTO } from '../dto';

export function registerFoldersRoutes(
    fastify: FastifyInstance,
    folderService: FolderService
) {
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
}
