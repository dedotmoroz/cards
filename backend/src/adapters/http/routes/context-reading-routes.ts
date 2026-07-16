import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
    GetNextContextCardsUseCase,
    ResetContextReadingUseCase,
    GenerateContextTextUseCase,
    GetContextReadingArtifactHistoryUseCase,
    PersistContextReadingArtifactUseCase,
} from '../../../application/context-reading-service';
import {
    fetchContextGenerationStatus,
    fetchContextAudio,
    fetchContextArtifactAudio,
    fetchContextAudioExistsByJobId,
    fetchContextAudioExistsByArtifactId,
    generateContextAudio,
    generateAndPromoteContextAudio,
} from '../../ai/ai-service-client';
import { CardDTO } from '../dto';
import { CONTEXT_READING_POOL_MODE_MISMATCH } from '../../../domain/context-reading';

export function registerContextReadingRoutes(
    fastify: FastifyInstance,
    getNextContextCardsUseCase: GetNextContextCardsUseCase,
    resetContextReadingUseCase: ResetContextReadingUseCase,
    generateContextTextUseCase: GenerateContextTextUseCase,
    getContextReadingArtifactHistoryUseCase: GetContextReadingArtifactHistoryUseCase,
    persistContextReadingArtifactUseCase: PersistContextReadingArtifactUseCase
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
                        onlyUnlearned: { type: 'boolean' },
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
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['context-reading'],
                summary: 'Get next cards for context reading',
            },
        },
        async (
            req: FastifyRequest<{
                Body: { folderId: string; limit?: number; onlyUnlearned?: boolean };
            }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { folderId, limit = 3, onlyUnlearned } = req.body;

            try {
                const result = await getNextContextCardsUseCase.execute({
                    userId,
                    folderId,
                    limit,
                    onlyUnlearned,
                });

                return reply.send({
                    cards: result.cards.map(c => c.toPublicDTO()),
                    progress: result.progress,
                    completed: result.completed,
                });
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.message === CONTEXT_READING_POOL_MODE_MISMATCH
                ) {
                    return reply.code(400).send({
                        message:
                            'Context reading pool mode does not match the active session. Reset progress before switching.',
                    });
                }
                throw error;
            }
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
                    required: ['cardIds'],
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
                tags: ['context-reading'],
                summary: 'Generate context text for cards',
            },
        },
        async (
            req: FastifyRequest<{
                Body: { cardIds: string[]; lang?: string; level?: string };
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
                if (error instanceof Error) {
                    if (error.message === 'Some cards not found' || error.message === 'Folder not found') {
                        return reply.code(404).send({ message: error.message });
                    }
                    if (error.message === 'Access denied') {
                        return reply.code(403).send({ message: error.message });
                    }
                    if (error.message === 'Cards must belong to the same folder') {
                        return reply.code(400).send({ message: error.message });
                    }
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

    /**
     * Persist completed generation as a folder artifact (append to history)
     */
    fastify.post(
        '/context-reading/persist',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['jobId', 'folderId', 'cardIds'],
                    properties: {
                        jobId: { type: 'string' },
                        folderId: { type: 'string', format: 'uuid' },
                        cardIds: {
                            type: 'array',
                            items: { type: 'string', format: 'uuid' },
                            minItems: 1,
                            maxItems: 5,
                        },
                        level: { type: 'string' },
                    },
                },
                tags: ['context-reading'],
                summary: 'Persist context reading artifact into folder history',
            },
        },
        async (
            req: FastifyRequest<{
                Body: {
                    jobId: string;
                    folderId: string;
                    cardIds: string[];
                    level?: string;
                };
            }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { jobId, folderId, cardIds, level } = req.body;

            try {
                const artifact = await persistContextReadingArtifactUseCase.execute({
                    userId,
                    jobId,
                    folderId,
                    cardIds,
                    level,
                });
                return reply.send(artifact.toPublicDTO());
            } catch (error) {
                if (error instanceof Error) {
                    if (
                        error.message === 'Folder not found' ||
                        error.message === 'Some cards not found'
                    ) {
                        return reply.code(404).send({ message: error.message });
                    }
                    if (error.message === 'Access denied') {
                        return reply.code(403).send({ message: error.message });
                    }
                    if (
                        error.message === 'Cards must belong to the same folder' ||
                        error.message === 'Invalid job type' ||
                        error.message === 'Job not completed'
                    ) {
                        return reply.code(400).send({ message: error.message });
                    }
                }
                throw error;
            }
        }
    );

    /**
     * Saved context artifact history for folder (oldest first)
     */
    fastify.get(
        '/context-reading/history',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    required: ['folderId'],
                    properties: {
                        folderId: { type: 'string', format: 'uuid' },
                    },
                },
                tags: ['context-reading'],
                summary: 'Get context reading artifact history for folder',
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: { folderId: string };
            }>,
            reply: FastifyReply
        ) => {
            const userId = (req.user as any).userId;
            const { folderId } = req.query;

            try {
                const artifacts = await getContextReadingArtifactHistoryUseCase.execute({
                    userId,
                    folderId,
                });

                return reply.send({
                    artifacts: artifacts.map(a => a.toPublicDTO()),
                });
            } catch (error) {
                if (error instanceof Error) {
                    if (error.message === 'Folder not found') {
                        return reply.code(404).send({ message: error.message });
                    }
                    if (error.message === 'Access denied') {
                        return reply.code(403).send({ message: error.message });
                    }
                }
                throw error;
            }
        }
    );

    /**
     * Контекстное обучение - аудио сгенерированного текста
     */
    fastify.get(
        '/context-reading/audio',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        jobId: { type: 'string' },
                        artifactId: { type: 'string', format: 'uuid' },
                    },
                },
                tags: ['context-reading'],
                summary: 'Stream context text audio (mp3) by jobId or artifactId',
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: { jobId?: string; artifactId?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { jobId, artifactId } = req.query;

            if ((!jobId && !artifactId) || (jobId && artifactId)) {
                return reply.code(400).send({
                    message: 'Provide exactly one of jobId or artifactId',
                });
            }

            try {
                const audioResponse = artifactId
                    ? await fetchContextArtifactAudio(artifactId)
                    : await fetchContextAudio(jobId!);

                reply.header('Content-Type', 'audio/mpeg');
                reply.header('Cache-Control', 'private, max-age=3600');

                if (audioResponse.body) {
                    return reply.send(audioResponse.body);
                }

                return reply.code(404).send({ message: 'Audio not found' });
            } catch (error) {
                if (
                    error instanceof Error &&
                    (error.message.includes('404') || error.message.includes('not found'))
                ) {
                    return reply.code(404).send({ message: 'Audio not found' });
                }
                throw error;
            }
        }
    );

    /**
     * Проверка наличия mp3 для jobId или artifactId.
     */
    fastify.get(
        '/context-reading/audio/exists',
        {
            preHandler: [fastify.authenticate],
            schema: {
                querystring: {
                    type: 'object',
                    properties: {
                        jobId: { type: 'string' },
                        artifactId: { type: 'string', format: 'uuid' },
                    },
                },
                tags: ['context-reading'],
                summary: 'Check context reading audio existence',
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            hasAudio: { type: 'boolean' },
                        },
                    },
                },
            },
        },
        async (
            req: FastifyRequest<{
                Querystring: { jobId?: string; artifactId?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { jobId, artifactId } = req.query;

            if ((!jobId && !artifactId) || (jobId && artifactId)) {
                return reply.code(400).send({
                    message: 'Provide exactly one of jobId or artifactId',
                });
            }

            try {
                if (jobId) {
                    const res = await fetchContextAudioExistsByJobId(jobId);
                    return reply.send(res);
                }
                const res = await fetchContextAudioExistsByArtifactId(artifactId!);
                return reply.send(res);
            } catch (error) {
                // Для UX считаем “не найдено” как hasAudio=false.
                return reply.send({ hasAudio: false });
            }
        }
    );

    /**
     * Ручная генерация аудио для jobId (опционально с промоутом в artifactId).
     */
    fastify.post(
        '/context-reading/audio/generate',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['jobId'],
                    properties: {
                        jobId: { type: 'string' },
                        artifactId: { type: 'string', format: 'uuid' },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        properties: {
                            ok: { type: 'boolean' },
                            hasAudio: { type: 'boolean' },
                        },
                    },
                },
                tags: ['context-reading'],
                summary: 'Generate context reading audio manually',
            },
        },
        async (
            req: FastifyRequest<{
                Body: { jobId: string; artifactId?: string };
            }>,
            reply: FastifyReply
        ) => {
            const { jobId, artifactId } = req.body;

            const result = artifactId
                ? await generateAndPromoteContextAudio(jobId, artifactId)
                : await generateContextAudio(jobId);

            return reply.send(result);
        }
    );
}
