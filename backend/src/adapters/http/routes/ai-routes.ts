import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { randomUUID } from 'crypto';
import { CardService } from '../../../application/card-service';
import { UserService } from '../../../application/user-service';
import { requestGeneration, fetchGenerationStatus } from '../../ai/ai-service-client';
import { CardDTO } from '../dto';
import { CardGenerateRequestDTO, CardGenerateRequestInput, CardGenerateStatusQueryDTO, CardGenerateStatusQuery } from './types';

export function registerAIRoutes(
    fastify: FastifyInstance,
    cardService: CardService,
    userService: UserService
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

            const { lang, level, count, target, sample } = req.body ?? {};
            const userId = (req.user as any).userId;
            const user = await userService.getById(userId);

            const payload = {
                target: target ?? card.question,
                translationSample: sample ?? card.answer,
                lang: lang ?? 'en',
                count: count ?? 1,
                level: level ?? 'B1',
                translationLang: user?.language ?? 'en',
                userId,
                traceId: randomUUID(),
            };
            const { jobId } = await requestGeneration(payload);
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
            const { jobId } = req.query;

            const card = await cardService.getById(id);
            if (!card) {
                return reply.code(404).send({ message: 'Card not found' });
            }

            const status = await fetchGenerationStatus(jobId);
            const progress = typeof status.progress === 'number' ? status.progress : 0;

            if (status.state === 'failed') {
                return reply.send({
                    status: 'failed',
                    progress,
                    error: status.error ?? 'Generation failed',
                });
            }

            if (status.state === 'completed' && status.result) {
                const sentences = status.result.sentences ?? [];
                const questionSentences = sentences
                    .map((item) => item.text.trim())
                    .filter(Boolean)
                    .join('\n');
                const answerSentences = sentences
                    .map((item) => item.translation.trim())
                    .filter(Boolean)
                    .join('\n');

                const updatedCard = await cardService.updateCard(id, {
                    questionSentences: questionSentences.length ? questionSentences : null,
                    answerSentences: answerSentences.length ? answerSentences : null,
                });

                if (!updatedCard) {
                    return reply.code(404).send({ message: 'Card not found' });
                }

                return reply.send({
                    status: 'completed',
                    progress: 100,
                    card: updatedCard.toPublicDTO(),
                });
            }

            return reply.send({
                status: status.state,
                progress,
            });
        },
    );
}
