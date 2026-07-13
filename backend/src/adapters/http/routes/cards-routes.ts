import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import ExcelJS from 'exceljs';
import { CardService } from '../../../application/card-service';
import { FolderRepository } from '../../../ports/folder-repository';
import { GoogleSheetsService } from '../../../application/google-sheets-service';
import {
    googlePickerAccessTokenFromRequest,
} from '../google-picker-access-token';
import { CreateCardDTO, CardDTO, CardSearchResultDTO, UpdateCardDTO, ReviewCardDTO } from '../dto';
import { CreateCardInput } from './types';
import type { CardRepository } from '../../../ports/card-repository';
import { translateForFolder } from '../../ai/translate-service';

export function registerCardsRoutes(
    fastify: FastifyInstance,
    cardService: CardService,
    folderRepo: FolderRepository,
    cardRepo: CardRepository,
    googleSheetsService?: GoogleSheetsService
) {
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
        }
    );

    /**
     * Создать Карточку из браузерного расширения
     */
    fastify.post('/ext/cards',
        {
            preHandler: [fastify.authenticate],
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
                    403: {
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
                tags: ['extension'],
                summary: 'Add word from browser extension',
            },
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
            const { word, folderId, sentence } = req.body;
            const userId = (req.user as { userId?: string }).userId;

            const folder = await folderRepo.findById(folderId);
            if (!folder) {
                return reply.code(404).send({ message: 'Folder not found' });
            }

            if (!userId || folder.userId !== userId) {
                return reply.code(403).send({ message: 'Access denied. Folder does not belong to user' });
            }

            const onTranslateError = (error: unknown) => {
                req.log.warn({ err: error }, 'Extension card translation failed');
            };

            const [answer, answerSentences] = await Promise.all([
                translateForFolder(folder.sideALanguage, folder.sideBLanguage, word, onTranslateError),
                sentence
                    ? translateForFolder(folder.sideALanguage, folder.sideBLanguage, sentence, onTranslateError)
                    : Promise.resolve(undefined),
            ]);

            const questionSentences = sentence ? sentence : undefined;

            const card = await cardService.createCard(
                folderId,
                word,
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
     * Массово изменить статус изучения всех карточек в папке
     */
    fastify.patch('/cards/folder/:folderId/learn-status',
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
                            updatedCount: { type: 'number' },
                        },
                    },
                },
                tags: ['cards'],
                summary: 'Change learn status for all cards in folder',
            },
        },
        async (
            req: FastifyRequest<{ Params: { folderId: string }; Body: { isLearned: boolean } }>,
            reply: FastifyReply
        ) => {
            const { folderId } = req.params;
            const { isLearned } = req.body;
            const userId = (req.user as { userId?: string }).userId;

            const folder = await folderRepo.findById(folderId);
            if (!folder) {
                return reply.code(404).send({ message: 'Folder not found' });
            }

            if (!userId || folder.userId !== userId) {
                return reply.code(403).send({ message: 'Access denied. Folder does not belong to user' });
            }

            const updatedCount = await cardService.setFolderLearnStatus(folderId, isLearned);
            return reply.send({ status: 'ok', updatedCount });
        }
    );

    /**
     * Ответ пользователя в обучении (заполняет статистику + SM-2)
     */
    fastify.post(
        '/cards/:id/review',
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
                body: zodToJsonSchema(ReviewCardDTO),
                response: {
                    200: zodToJsonSchema(CardDTO),
                    403: {
                        type: 'object',
                        properties: { message: { type: 'string' } },
                    },
                    404: {
                        type: 'object',
                        properties: { message: { type: 'string' } },
                    },
                },
                tags: ['cards'],
                summary: 'Review a card (know/dontknow)',
            },
        },
        async (
            req: FastifyRequest<{ Params: { id: string }; Body: z.infer<typeof ReviewCardDTO> }>,
            reply: FastifyReply
        ) => {
            const { id } = req.params;
            const authUserId = (req.user as any).userId as string | undefined;

            const card = await cardService.getById(id);
            if (!card) return reply.code(404).send({ message: 'Card not found' });

            const folder = await folderRepo.findById(card.folderId);
            if (!folder || !authUserId || folder.userId !== authUserId) {
                return reply.code(403).send({ message: 'Access denied' });
            }

            const updated = await cardService.reviewCard(id, req.body.outcome);
            if (!updated) return reply.code(404).send({ message: 'Card not found' });
            return reply.send(updated.toPublicDTO());
        }
    );

    /**
     * Глобальный поиск карточек по всем папкам пользователя
     */
    fastify.get(
        '/cards/search',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    required: ['q'],
                    properties: {
                        q: { type: 'string' },
                        limit: { type: 'number', minimum: 1, maximum: 100 },
                        offset: { type: 'number', minimum: 0 },
                    },
                },
                response: {
                    200: {
                        type: 'array',
                        items: zodToJsonSchema(CardSearchResultDTO),
                    },
                },
                tags: ['cards'],
                summary: 'Search cards across all user folders',
            },
        },
        async (
            req: FastifyRequest<{ Querystring: { q: string; limit?: number; offset?: number } }>,
            reply: FastifyReply
        ) => {
            const authUserId = (req.user as { userId?: string }).userId;
            if (!authUserId) return reply.send([]);

            const q = req.query.q?.trim() ?? '';
            if (q.length < 2) return reply.send([]);

            const limit = Math.max(1, Math.min(100, Number(req.query.limit ?? 30)));
            const offset = Math.max(0, Number(req.query.offset ?? 0));

            const userFolders = await folderRepo.findAll(authUserId);
            const folderIds = userFolders.map((f) => f.id);
            if (folderIds.length === 0) return reply.send([]);

            const folderNameById = Object.fromEntries(userFolders.map((f) => [f.id, f.name]));
            const results = await cardService.searchCards(folderIds, q, limit, offset);

            return reply.send(
                results.map(({ card, folderName }) => ({
                    ...card.toPublicDTO(),
                    folderName: folderName || folderNameById[card.folderId] || '',
                }))
            );
        }
    );

    /**
     * Сколько всего карточек у пользователя (все папки) — для скрытия «Вспомни» в UI, если меньше 10.
     */
    fastify.get(
        '/cards/virtual/remember/eligible-count',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        required: ['count'],
                        properties: { count: { type: 'number' } },
                    },
                },
                tags: ['cards'],
                summary: 'Total card count for Remember virtual folder visibility',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const authUserId = (req.user as any).userId as string | undefined;
            if (!authUserId) return reply.send({ count: 0 });

            const userFolders = await folderRepo.findAll(authUserId);
            const folderIds = userFolders.map((f) => f.id);
            if (folderIds.length === 0) return reply.send({ count: 0 });

            const perFolder = await cardRepo.countByFolderIds(folderIds);
            const count = Object.values(perFolder).reduce((sum, n) => sum + (n ?? 0), 0);
            return reply.send({ count });
        }
    );

    /**
     * Виртуальная папка: Вспомни (самые «давние» по coalesce(lastLearnedAt, createdAt), все карточки)
     */
    fastify.get(
        '/cards/virtual/remember',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: { limit: { type: 'number', minimum: 1, maximum: 50 } },
                },
                response: {
                    200: {
                        type: 'array',
                        items: zodToJsonSchema(CardDTO),
                    },
                },
                tags: ['cards'],
                summary: 'Virtual folder: remember (oldest by lastLearnedAt/createdAt)',
            },
        },
        async (
            req: FastifyRequest<{ Querystring: { limit?: number } }>,
            reply: FastifyReply
        ) => {
            const authUserId = (req.user as any).userId as string | undefined;
            const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 10)));
            if (!authUserId) return reply.send([]);

            const userFolders = await folderRepo.findAll(authUserId);
            const folderIds = userFolders.map((f) => f.id);
            const cards = await cardRepo.findRememberCardsByFolderIds(folderIds, limit);
            return reply.send(cards.map((c) => c.toPublicDTO()));
        }
    );

    /**
     * Сколько карточек попадает в «Сложно» (выученные, reviewCount >= 2) — для счётчика и скрытия папки.
     */
    fastify.get(
        '/cards/virtual/hard/eligible-count',
        {
            preHandler: [fastify.authenticate],
            schema: {
                response: {
                    200: {
                        type: 'object',
                        required: ['count'],
                        properties: { count: { type: 'number' } },
                    },
                },
                tags: ['cards'],
                summary: 'Count of cards in Hard virtual folder',
            },
        },
        async (req: FastifyRequest, reply: FastifyReply) => {
            const authUserId = (req.user as any).userId as string | undefined;
            if (!authUserId) return reply.send({ count: 0 });

            const userFolders = await folderRepo.findAll(authUserId);
            const folderIds = userFolders.map((f) => f.id);
            const count = await cardRepo.countHardCardsByFolderIds(folderIds);
            return reply.send({ count });
        }
    );

    /**
     * Виртуальная папка: Сложно (до 10 самых сложных среди выученных с reviewCount >= 2)
     */
    fastify.get(
        '/cards/virtual/hard',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: { limit: { type: 'number', minimum: 1, maximum: 50 } },
                },
                response: {
                    200: {
                        type: 'array',
                        items: zodToJsonSchema(CardDTO),
                    },
                },
                tags: ['cards'],
                summary: 'Virtual folder: hard (most difficult)',
            },
        },
        async (
            req: FastifyRequest<{ Querystring: { limit?: number } }>,
            reply: FastifyReply
        ) => {
            const authUserId = (req.user as any).userId as string | undefined;
            const limit = Math.max(1, Math.min(50, Number(req.query.limit ?? 10)));
            if (!authUserId) return reply.send([]);

            const userFolders = await folderRepo.findAll(authUserId);
            const folderIds = userFolders.map((f) => f.id);
            const cards = await cardRepo.findHardCardsByFolderIds(folderIds, limit);
            return reply.send(cards.map((c) => c.toPublicDTO()));
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
            try {
                const updatedCard = await cardService.updateCard(id, req.body);
                if (!updatedCard) {
                    return reply.code(404).send({ message: 'Card not found' });
                }
                return reply.code(200).send(updatedCard.toPublicDTO());
            } catch (error) {
                if (error instanceof Error && error.message === 'Context not found') {
                    return reply.code(404).send({ message: 'Context not found' });
                }
                throw error;
            }
        }
    );

    /**
     * Удалить один сохранённый контекст карточки
     */
    fastify.delete('/cards/:id/contexts/:contextId',
        {
            preHandler: [fastify.authenticate],
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        contextId: { type: 'string', format: 'uuid' },
                    },
                    required: ['id', 'contextId'],
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
                summary: 'Delete a card context',
            },
        },
        async (
            req: FastifyRequest<{ Params: { id: string; contextId: string } }>,
            reply: FastifyReply
        ) => {
            const { id, contextId } = req.params;
            try {
                const updated = await cardService.removeContext(id, contextId);
                if (!updated) {
                    return reply.code(404).send({ message: 'Card not found' });
                }
                return reply.code(200).send(updated.toPublicDTO());
            } catch (error) {
                if (error instanceof Error && error.message === 'Context not found') {
                    return reply.code(404).send({ message: 'Context not found' });
                }
                throw error;
            }
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
     * Экспорт карточек папки в Excel
     */
    fastify.get('/cards/folder/:folderId/export',
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
                tags: ['cards'],
                summary: 'Export cards from folder to Excel',
            },
        },
        async (req: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) => {
            const { folderId } = req.params;

            const cards = await cardService.getAll(folderId);

            const folder = await folderRepo.findById(folderId);
            const folderName = folder?.name || 'cards';

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cards');

            worksheet.columns = [
                { header: 'Сторона A', key: 'question', width: 50 },
                { header: 'Сторона B', key: 'answer', width: 50 },
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };

            cards.forEach(card => {
                worksheet.addRow({
                    question: card.question,
                    answer: card.answer,
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();

            const fileName = `${folderName}_${new Date().toISOString().split('T')[0]}.xlsx`;
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            reply.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

            return reply.send(buffer);
        }
    );

    /**
     * Импорт карточек из Excel
     */
    fastify.post('/cards/folder/:folderId/import',
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
                tags: ['cards'],
                summary: 'Import cards from Excel file',
            },
        },
        async (req: FastifyRequest<{ Params: { folderId: string } }>, reply: FastifyReply) => {
            const { folderId } = req.params;
            const userId = (req.user as any).userId;

            const folder = await folderRepo.findById(folderId);
            if (!folder) {
                return reply.code(404).send({ message: 'Folder not found' });
            }

            if (folder.userId !== userId) {
                return reply.code(403).send({ message: 'Access denied. Folder does not belong to user' });
            }

            if (!req.isMultipart()) {
                return reply.code(400).send({ message: 'Request must be multipart/form-data' });
            }

            const data = await req.file();

            if (!data) {
                return reply.code(400).send({ message: 'No file provided' });
            }

            const allowedMimeTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ];

            if (!allowedMimeTypes.includes(data.mimetype)) {
                return reply.code(400).send({
                    message: 'Invalid file type. Only .xlsx and .xls files are supported'
                });
            }

            try {
                const buffer = await data.toBuffer();

                const workbook = new ExcelJS.Workbook();

                if (data.mimetype === 'application/vnd.ms-excel') {
                    return reply.code(400).send({
                        message: '.xls format is not supported. Please use .xlsx format'
                    });
                }

                await workbook.xlsx.load(buffer as any);

                const worksheet = workbook.worksheets[0];
                if (!worksheet) {
                    return reply.code(400).send({ message: 'Excel file is empty' });
                }

                let questionColIndex: number | null = null;
                let answerColIndex: number | null = null;

                const headerRow = worksheet.getRow(1);
                headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                    const headerValue = cell.value?.toString().trim() || '';
                    if (headerValue === 'Сторона A' || headerValue === 'Side A' || headerValue.toLowerCase() === 'question') {
                        questionColIndex = colNumber;
                    }
                    if (headerValue === 'Сторона B' || headerValue === 'Side B' || headerValue.toLowerCase() === 'answer') {
                        answerColIndex = colNumber;
                    }
                });

                if (questionColIndex === null || answerColIndex === null) {
                    return reply.code(400).send({
                        message: 'Excel file must contain columns "Сторона A" (or "Side A" or "Question") and "Сторона B" (or "Side B" or "Answer")'
                    });
                }

                let rowIndex = 2;
                let successCount = 0;
                let errorCount = 0;
                const errors: string[] = [];

                const lastRow = worksheet.lastRow;
                const maxRow = lastRow ? lastRow.number : 0;

                while (rowIndex <= maxRow) {
                    const row = worksheet.getRow(rowIndex);
                    const questionCell = row.getCell(questionColIndex);
                    const answerCell = row.getCell(answerColIndex);

                    const question = questionCell.value?.toString().trim() || '';
                    const answer = answerCell.value?.toString().trim() || '';

                    if (!question && !answer) {
                        rowIndex++;
                        continue;
                    }

                    if (!question || !answer) {
                        errorCount++;
                        errors.push(`Row ${rowIndex}: Both question and answer must be filled`);
                        rowIndex++;
                        continue;
                    }

                    try {
                        await cardService.createCard(folderId, question, answer);
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        errors.push(`Row ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }

                    rowIndex++;
                }

                if (successCount === 0 && errorCount > 0) {
                    return reply.code(400).send({
                        message: 'No cards were imported',
                        errors,
                    });
                }

                return reply.code(200).send({
                    message: 'Import completed',
                    successCount,
                    errorCount,
                    errors: errors.length > 0 ? errors : undefined,
                });
            } catch (error) {
                req.log.error({ err: error }, 'Error importing Excel file');

                if (error instanceof Error && error.message.includes('Invalid file')) {
                    return reply.code(400).send({
                        message: 'Invalid Excel file format. Please ensure the file is a valid .xlsx file'
                    });
                }

                return reply.code(500).send({
                    message: error instanceof Error ? error.message : 'Error importing Excel file'
                });
            }
        }
    );

    if (googleSheetsService) {
        /**
         * Импорт карточек из Google Sheets
         */
        fastify.post('/cards/folder/:folderId/import/google',
            {
                preHandler: [fastify.authenticate],
                schema: {
                    params: {
                        type: 'object',
                        properties: { folderId: { type: 'string', format: 'uuid' } },
                        required: ['folderId'],
                    },
                    body: {
                        type: 'object',
                        required: ['spreadsheetId'],
                        properties: {
                            spreadsheetId: { type: 'string' },
                            sheetName: { type: 'string' },
                            googlePickerAccessToken: { type: 'string' },
                        },
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' },
                                successCount: { type: 'number' },
                                errorCount: { type: 'number' },
                                errors: { type: 'array', items: { type: 'string' } },
                            },
                        },
                    },
                    tags: ['cards'],
                    summary: 'Import cards from Google Sheets',
                },
            },
            async (req: FastifyRequest<{
                Params: { folderId: string };
                Body: { spreadsheetId: string; sheetName?: string; googlePickerAccessToken?: string };
            }>, reply: FastifyReply) => {
                const userId = (req.user as any).userId;
                const { folderId } = req.params;
                const { spreadsheetId, sheetName = 'Sheet1', googlePickerAccessToken: bodyPickerToken } =
                    req.body;
                const googlePickerAccessToken = googlePickerAccessTokenFromRequest(req, bodyPickerToken);

                const folder = await folderRepo.findById(folderId);
                if (!folder) return reply.code(404).send({ message: 'Folder not found' });
                if (folder.userId !== userId) return reply.code(403).send({ message: 'Access denied' });

                try {
                    const rows = await googleSheetsService.getSpreadsheetData(userId, spreadsheetId, {
                        sheetName,
                        ...(googlePickerAccessToken ? { googlePickerAccessToken } : {}),
                    });
                    if (rows.length < 2) {
                        return reply.code(400).send({ message: 'Sheet is empty or has no data rows' });
                    }

                    const headerRow = rows[0].map((c) => (c ?? '').toString());
                    const colIndexes = googleSheetsService.findQuestionAndAnswerColumnIndexes(headerRow);
                    if (!colIndexes) {
                        return reply.code(400).send({
                            message: 'Sheet must have columns "Сторона A" (or "Side A"/"Question") and "Сторона B" (or "Side B"/"Answer")',
                        });
                    }

                    let successCount = 0;
                    let errorCount = 0;
                    const errors: string[] = [];

                    for (let i = 1; i < rows.length; i++) {
                        const row = rows[i] || [];
                        const question = (row[colIndexes.question] ?? '').toString().trim();
                        const answer = (row[colIndexes.answer] ?? '').toString().trim();
                        if (!question && !answer) continue;
                        if (!question || !answer) {
                            errorCount++;
                            errors.push(`Row ${i + 1}: Both question and answer must be filled`);
                            continue;
                        }
                        try {
                            await cardService.createCard(folderId, question, answer);
                            successCount++;
                        } catch (err) {
                            errorCount++;
                            errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                        }
                    }

                    if (successCount === 0 && errorCount > 0) {
                        return reply.code(400).send({ message: 'No cards were imported', errors });
                    }

                    return reply.send({
                        message: 'Import completed',
                        successCount,
                        errorCount,
                        errors: errors.length > 0 ? errors : undefined,
                    });
                } catch (err) {
                    req.log.error({ err }, 'Google Sheets import error');
                    const msg = err instanceof Error ? err.message : 'Import failed';
                    return reply.code(400).send({ message: msg });
                }
            }
        );

        /**
         * Экспорт карточек в Google Sheets
         */
        fastify.post('/cards/folder/:folderId/export/google',
            {
                preHandler: [fastify.authenticate],
                schema: {
                    params: {
                        type: 'object',
                        properties: { folderId: { type: 'string', format: 'uuid' } },
                        required: ['folderId'],
                    },
                    body: {
                        type: 'object',
                        properties: {
                            mode: { type: 'string', enum: ['new', 'existing'] },
                            title: { type: 'string' },
                            spreadsheetId: { type: 'string' },
                            sheetName: { type: 'string' },
                            append: { type: 'boolean' },
                            googlePickerAccessToken: { type: 'string' },
                        },
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                spreadsheetUrl: { type: 'string' },
                                spreadsheetId: { type: 'string' },
                            },
                        },
                    },
                    tags: ['cards'],
                    summary: 'Export cards to Google Sheets',
                },
            },
            async (req: FastifyRequest<{
                Params: { folderId: string };
                Body: {
                    mode?: 'new' | 'existing';
                    title?: string;
                    spreadsheetId?: string;
                    sheetName?: string;
                    append?: boolean;
                    googlePickerAccessToken?: string;
                };
            }>, reply: FastifyReply) => {
                const userId = (req.user as any).userId;
                const { folderId } = req.params;
                const {
                    mode = 'new',
                    title: bodyTitle,
                    spreadsheetId,
                    sheetName = 'Sheet1',
                    append = false,
                    googlePickerAccessToken: bodyPickerToken,
                } = req.body;
                const googlePickerAccessToken = googlePickerAccessTokenFromRequest(req, bodyPickerToken);

                const folder = await folderRepo.findById(folderId);
                if (!folder) return reply.code(404).send({ message: 'Folder not found' });
                if (folder.userId !== userId) return reply.code(403).send({ message: 'Access denied' });

                if (mode === 'existing' && !spreadsheetId?.trim()) {
                    return reply.code(400).send({ message: 'spreadsheetId is required for existing spreadsheet export' });
                }

                const cards = await cardService.getAll(folderId);
                const rows = cards.map((c) => ({ question: c.question, answer: c.answer }));
                const pickerOpts = googlePickerAccessToken
                    ? { googlePickerAccessToken }
                    : undefined;

                try {
                    if (mode === 'existing') {
                        const result = await googleSheetsService.writeToExistingSpreadsheet(
                            userId,
                            spreadsheetId!.trim(),
                            sheetName.trim() || 'Sheet1',
                            rows,
                            { ...(pickerOpts ?? {}), append },
                        );
                        return reply.send({
                            spreadsheetUrl: result.spreadsheetUrl,
                            spreadsheetId: result.spreadsheetId,
                        });
                    }

                    const title = bodyTitle?.trim() || `${folder.name}_${new Date().toISOString().split('T')[0]}`;
                    const result = await googleSheetsService.createSpreadsheetAndWrite(
                        userId,
                        title,
                        rows,
                        pickerOpts,
                    );
                    return reply.send({
                        spreadsheetUrl: result.spreadsheetUrl,
                        spreadsheetId: result.spreadsheetId,
                    });
                } catch (err) {
                    req.log.error({ err }, 'Google Sheets export error');
                    const msg = err instanceof Error ? err.message : 'Export failed';
                    return reply.code(400).send({ message: msg });
                }
            }
        );
    }
}
