import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import ExcelJS from 'exceljs';
import { CardService } from '../../../application/card-service';
import { FolderRepository } from '../../../ports/folder-repository';
import { CreateCardDTO, CardDTO, UpdateCardDTO } from '../dto';
import { CreateCardInput } from './types';

export function registerCardsRoutes(
    fastify: FastifyInstance,
    cardService: CardService,
    folderRepo: FolderRepository
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

            const question = word;
            const answer = '';
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
}
