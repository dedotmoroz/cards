import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { randomUUID } from 'crypto';
import {
    CardService,
    ContextLimitReachedError,
    MAX_CARD_CONTEXTS,
} from '../../../application/card-service';
import { UserService } from '../../../application/user-service';
import { FolderRepository } from '../../../ports/folder-repository';
import { requestGeneration, fetchGenerationStatus } from '../../ai/ai-service-client';
import { CardDTO } from '../dto';
import { CardGenerateRequestDTO, CardGenerateRequestInput, CardGenerateStatusQueryDTO, CardGenerateStatusQuery } from './types';

/** Pending generate options keyed by jobId (in-process; lost on restart is OK for this UX). */
const pendingGenerateOptions = new Map<string, { replaceOldest: boolean }>();

export function registerAIRoutes(
    fastify: FastifyInstance,
    cardService: CardService,
    _userService: UserService,
    folderRepo: FolderRepository,
) {
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
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            code: { type: 'string' },
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

            const { lang, level, count, target, sample, replaceOldest } = req.body ?? {};
            const userId = (req.user as any).userId as string;

            const folder = await folderRepo.findById(card.folderId);
            if (!folder) {
                return reply.code(404).send({ message: 'Folder not found' });
            }
            if (folder.userId !== userId) {
                return reply.code(403).send({ message: 'Access denied' });
            }

            if (card.contexts.length >= MAX_CARD_CONTEXTS && !replaceOldest) {
                return reply.code(400).send({
                    message: 'Card already has the maximum number of contexts',
                    code: 'CONTEXT_LIMIT_REACHED',
                });
            }

            const payload = {
                target: target ?? card.question,
                translationSample: sample ?? card.answer,
                lang: lang ?? folder.sideALanguage,
                translationLang: folder.sideBLanguage,
                count: count ?? 1,
                level: level ?? 'B1',
                userId,
                traceId: randomUUID(),
            };
            const { jobId } = await requestGeneration(payload);
            pendingGenerateOptions.set(jobId, { replaceOldest: !!replaceOldest });
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
            const { jobId, replaceOldest: replaceOldestQuery } = req.query;

            const card = await cardService.getById(id);
            if (!card) {
                return reply.code(404).send({ message: 'Card not found' });
            }

            const status = await fetchGenerationStatus(jobId);
            const progress = typeof status.progress === 'number' ? status.progress : 0;

            if (status.state === 'failed') {
                pendingGenerateOptions.delete(jobId);
                return reply.send({
                    status: 'failed',
                    progress,
                    error: status.error ?? 'Generation failed',
                });
            }

            if (status.queueType && status.queueType !== 'generate') {
                return reply.code(400).send({
                    message:
                        'Invalid job type. Expected generate job, but got context job. Please use jobId from POST /cards/:id/generate.',
                });
            }

            if (
                status.state === 'completed' &&
                status.result &&
                'sentences' in status.result &&
                Array.isArray(status.result.sentences)
            ) {
                const sentences = status.result.sentences;
                const text = sentences
                    .map((item) => item.text.trim())
                    .filter(Boolean)
                    .join('\n');
                const translation = sentences
                    .map((item) => item.translation.trim())
                    .filter(Boolean)
                    .join('\n');

                if (!text && !translation) {
                    pendingGenerateOptions.delete(jobId);
                    return reply.send({
                        status: 'completed',
                        progress: 100,
                        card: card.toPublicDTO(),
                    });
                }

                const pending = pendingGenerateOptions.get(jobId);
                const replaceOldest =
                    replaceOldestQuery ?? pending?.replaceOldest ?? false;
                pendingGenerateOptions.delete(jobId);

                try {
                    const updatedCard = await cardService.appendContext(
                        id,
                        { text, translation },
                        { replaceOldest },
                    );

                    if (!updatedCard) {
                        return reply.code(404).send({ message: 'Card not found' });
                    }

                    return reply.send({
                        status: 'completed',
                        progress: 100,
                        card: updatedCard.toPublicDTO(),
                    });
                } catch (error) {
                    if (error instanceof ContextLimitReachedError) {
                        return reply.code(400).send({
                            message: error.message,
                            code: error.code,
                        });
                    }
                    throw error;
                }
            }

            return reply.send({
                status: status.state,
                progress,
            });
        },
    );
}
