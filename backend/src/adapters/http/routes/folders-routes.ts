import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FolderService } from '../../../application/folder-service';
import { CardRepository } from '../../../ports/card-repository';
import { CreateFolderDTO, FolderDTO, UpdateFolderDTO } from '../dto';

function folderToDto(
    folder: {
        id: string;
        userId: string;
        name: string;
        sideALanguage: string;
        sideBLanguage: string;
    },
    cardCount?: number,
) {
    return {
        id: folder.id,
        userId: folder.userId,
        name: folder.name,
        sideALanguage: folder.sideALanguage,
        sideBLanguage: folder.sideBLanguage,
        ...(cardCount !== undefined ? { cardCount } : {}),
    };
}

export function registerFoldersRoutes(
    fastify: FastifyInstance,
    folderService: FolderService,
    cardRepo: CardRepository
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
            const { userId, name, sideALanguage, sideBLanguage } = req.body;
            const folder = await folderService.createFolder(
                userId,
                name,
                sideALanguage,
                sideBLanguage,
            );
            return reply.code(201).send(folderToDto(folder));
        }
    );

    /**
     * Обновить папку (название и языки сторон)
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
                body: zodToJsonSchema(UpdateFolderDTO),
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
                summary: 'Update folder',
            },
        },
        async (
            req: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof UpdateFolderDTO> }>,
            reply: FastifyReply
        ) => {
            const { id } = req.params;
            const { name, sideALanguage, sideBLanguage } = req.body;
            if (name === undefined && sideALanguage === undefined && sideBLanguage === undefined) {
                return reply.code(400).send({ message: 'At least one field is required' });
            }
            const updated = await folderService.updateFolder(id, {
                name,
                sideALanguage,
                sideBLanguage,
            });
            if (!updated) {
                return reply.code(404).send({ message: 'Folder not found' });
            }
            return reply.send(folderToDto(updated));
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
            if (folders.length === 0) {
                return reply.send([]);
            }
            const counts = await cardRepo.countByFolderIds(folders.map((f) => f.id));
            const foldersWithCounts = folders.map((f) =>
                folderToDto(f, counts[f.id] ?? 0),
            );
            return reply.send(foldersWithCounts);
        }
    );
}
