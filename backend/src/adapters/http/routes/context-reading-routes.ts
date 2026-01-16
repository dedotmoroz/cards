import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { GetNextContextCardsUseCase, ResetContextReadingUseCase, GenerateContextTextUseCase } from '../../../application/context-reading-service';
import { fetchContextGenerationStatus } from '../../ai/ai-service-client';
import { CardDTO } from '../dto';

export function registerContextReadingRoutes(
    fastify: FastifyInstance,
    getNextContextCardsUseCase: GetNextContextCardsUseCase,
    resetContextReadingUseCase: ResetContextReadingUseCase,
    generateContextTextUseCase: GenerateContextTextUseCase
) {
    /**
     * Контекстное обучение - получение карточек
     */
    fastify.post(
        '/context-reading/next',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['folderId'],
                    properties: {
                        folderId: { type: 'string', format: 'uuid' },
                        limit: { type: 'number', minimum: 1, maximum: 5 },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            cards: {
                                type: 'array',
                                items: zodToJsonSchema(CardDTO),
                            },
                            progress: {
                                type: 'object',
                                properties: {
                                    used: { type: 'number' },
                                    total: { type: 'number' },
                                },
                            },
                            completed: { type: 'boolean' },
                        },
                    },
                },
                tags: ['context-reading'],
                summary: 'Get next cards for context reading',
            },
        },
        async (
            req: FastifyRequest<{
                Body: { folderId: string; limit?: number };
            }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { folderId, limit = 3 } = req.body;

            const result = await getNextContextCardsUseCase.execute({
                userId,
                folderId,
                limit,
            });

            return reply.send({
                cards: result.cards.map(c => c.toPublicDTO()),
                progress: result.progress,
                completed: result.completed,
            });
        }
    );

    /**
     * Контекстное обучение - сбросить прогресс контекстного чтения
     */
    fastify.post(
        '/context-reading/reset',
        {
            preHandler: [fastify.authenticate],
            schema: {
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
                },
                tags: ['context-reading'],
                summary: 'Reset context reading progress',
            },
        },
        async (
            req: FastifyRequest<{ Body: { folderId: string } }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { folderId } = req.body;

            await resetContextReadingUseCase.execute({
                userId,
                folderId,
            });

            return reply.send({ ok: true });
        }
    );

    /**
     * Контекстное обучение - генерация текста для карточек
     */
    fastify.post(
        '/context-reading/generate',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['cardIds', 'lang'],
                    properties: {
                        cardIds: {
                            type: 'array',
                            items: { type: 'string', format: 'uuid' },
                            minItems: 3,
                            maxItems: 5,
                        },
                        lang: { type: 'string' },
                        level: { type: 'string' },
                    },
                },
                response: {
                    202: {
                        type: 'object',
                        required: ['jobId'],
                        properties: {
                            jobId: { type: 'string' },
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
                tags: ['context-reading'],
                summary: 'Generate context text for cards',
            },
        },
        async (
            req: FastifyRequest<{
                Body: { cardIds: string[]; lang: string; level?: string };
            }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { cardIds, lang, level } = req.body;

            try {
                const result = await generateContextTextUseCase.execute({
                    userId,
                    cardIds,
                    lang,
                    level,
                });

                return reply.code(202).send(result);
            } catch (error) {
                if (error instanceof Error && error.message === 'Some cards not found') {
                    return reply.code(404).send({ message: error.message });
                }
                throw error;
            }
        }
    );

    /**
     * Контекстное обучение - статус генерации текста
     */
    fastify.get(
        '/context-reading/generate-status',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    required: ['jobId'],
                    properties: {
                        jobId: { type: 'string' },
                    },
                },
                tags: ['context-reading'],
                summary: 'Get context text generation status',
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: { jobId: string };
            }>,
            reply: FastifyReply
        ) => {
            const { jobId } = req.query;

            try {
                const status = await fetchContextGenerationStatus(jobId);

                if (status.queueType && status.queueType !== 'context') {
                    return reply.code(400).send({
                        message: 'Invalid job type. Expected context job, but got generate job. Please use correct jobId from context-reading/generate endpoint.'
                    });
                }

                if (!status.queueType && status.result && 'sentences' in status.result) {
                    return reply.code(400).send({
                        message: 'Invalid job type. Expected context job, but got generate job. Please use correct jobId from context-reading/generate endpoint.'
                    });
                }

                return reply.send(status);
            } catch (error) {
                if (error instanceof Error && error.message.includes('404')) {
                    return reply.code(404).send({ message: 'Job not found' });
                }
                throw error;
            }
        }
    );
}
