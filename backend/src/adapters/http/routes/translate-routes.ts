import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { translateText, mapLanguageToGoogleFormat } from '../../ai/translate-service';

const TranslateRequestDTO = z.object({
    text: z.string().min(1).max(5000), // ограничение на длину текста
    targetLang: z.string().min(2).max(10),
    sourceLang: z.string().optional(),
});

type TranslateRequestInput = z.infer<typeof TranslateRequestDTO>;

export function registerTranslateRoutes(fastify: FastifyInstance) {
    /**
     * Перевести текст
     */
    fastify.post(
        '/translate',
        {
            preHandler: [fastify.authenticate],
            schema: {
                body: {
                    type: 'object',
                    required: ['text', 'targetLang'],
                    properties: {
                        text: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 5000,
                        },
                        targetLang: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 10,
                        },
                        sourceLang: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 10,
                        },
                    },
                },
                response: {
                    200: {
                        type: 'object',
                        required: ['translatedText'],
                        properties: {
                            translatedText: { type: 'string' },
                            detectedSourceLanguage: { type: 'string' },
                        },
                    },
                    400: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                    500: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                        },
                    },
                },
                tags: ['translate'],
                summary: 'Translate text using Google Translate API',
            },
        },
        async (
            req: FastifyRequest<{ Body: TranslateRequestInput }>,
            reply: FastifyReply
        ) => {
            try {
                const body = TranslateRequestDTO.parse(req.body);

                const targetLang = mapLanguageToGoogleFormat(body.targetLang);
                const sourceLang = body.sourceLang
                    ? mapLanguageToGoogleFormat(body.sourceLang)
                    : undefined;

                const result = await translateText({
                    text: body.text,
                    targetLang,
                    sourceLang,
                });

                return reply.send({
                    translatedText: result.translatedText,
                    detectedSourceLanguage: result.detectedSourceLanguage,
                });
            } catch (error) {
                if (error instanceof z.ZodError) {
                    return reply.code(400).send({
                        message: 'Invalid request data',
                        errors: error.errors,
                    });
                }

                if (error instanceof Error) {
                    req.log.error({ err: error }, 'Translation error');
                    
                    // Если ошибка связана с API ключом или конфигурацией
                    if (error.message.includes('API key') || error.message.includes('not configured')) {
                        return reply.code(500).send({
                            message: 'Translation service is not configured',
                        });
                    }

                    return reply.code(500).send({
                        message: error.message || 'Failed to translate text',
                    });
                }

                return reply.code(500).send({
                    message: 'Internal server error',
                });
            }
        }
    );
}
