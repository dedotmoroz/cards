import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { publishCollection, publishPage, StrapiRequestError } from '../../cms/strapi-client';
import {
    PublishCollectionDTO,
    PublishCollectionBody,
    PublishPageDTO,
    PublishPageBody,
} from './types';

const publishResponseSchema = {
    201: {
        type: 'object',
        required: ['slug'],
        properties: {
            id: {
                oneOf: [{ type: 'string' }, { type: 'number' }],
            },
            slug: { type: 'string' },
        },
    },
    400: {
        type: 'object',
        properties: {
            message: { type: 'string' },
            errors: {},
        },
    },
    502: {
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
} as const;

function handlePublishError(
    req: FastifyRequest,
    reply: FastifyReply,
    error: unknown,
    failedMessage: string,
) {
    if (error instanceof z.ZodError) {
        return reply.code(400).send({
            message: 'Invalid request data',
            errors: error.errors,
        });
    }

    if (error instanceof StrapiRequestError) {
        req.log.error(
            { err: error, status: error.status, body: error.responseBody },
            'Strapi publish failed',
        );
        return reply.code(502).send({
            message: failedMessage,
        });
    }

    if (error instanceof Error) {
        req.log.error({ err: error }, 'Publish error');
        return reply.code(500).send({
            message: error.message || 'Failed to publish',
        });
    }

    return reply.code(500).send({
        message: 'Internal server error',
    });
}

export function registerPublishRoutes(fastify: FastifyInstance) {
    fastify.post(
        '/publish/page',
        {
            schema: {
                body: zodToJsonSchema(PublishPageDTO),
                response: publishResponseSchema,
                tags: ['cms'],
                summary: 'Publish a Page entry to Strapi',
            },
        },
        async (req: FastifyRequest<{ Body: PublishPageBody | undefined }>, reply: FastifyReply) => {
            try {
                const body = PublishPageDTO.parse(req.body);
                const result = await publishPage(body);
                return reply.code(201).send({
                    id: result.id,
                    slug: result.slug,
                });
            } catch (error) {
                return handlePublishError(
                    req,
                    reply,
                    error,
                    'Failed to publish page to CMS',
                );
            }
        },
    );

    fastify.post(
        '/publish/collection',
        {
            schema: {
                body: zodToJsonSchema(PublishCollectionDTO),
                response: publishResponseSchema,
                tags: ['cms'],
                summary: 'Publish a Collection entry to Strapi',
            },
        },
        async (
            req: FastifyRequest<{ Body: PublishCollectionBody | undefined }>,
            reply: FastifyReply,
        ) => {
            try {
                const body = PublishCollectionDTO.parse(req.body);
                const result = await publishCollection(body);
                return reply.code(201).send({
                    id: result.id,
                    slug: result.slug,
                });
            } catch (error) {
                return handlePublishError(
                    req,
                    reply,
                    error,
                    'Failed to publish collection to CMS',
                );
            }
        },
    );
}
