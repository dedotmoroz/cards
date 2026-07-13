import { z } from 'zod';
import { CreateCardDTO } from '../dto';

export type CreateCardInput = z.infer<typeof CreateCardDTO>;

export const CardGenerateRequestDTO = z
    .object({
        lang: z.string().optional(),
        level: z.string().optional(),
        count: z.number().int().positive().max(20).optional(),
        target: z.string().optional(),
        sample: z.string().optional(),
        replaceOldest: z.boolean().optional(),
    })
    .describe('CardGenerateRequestDTO');
export type CardGenerateRequestInput = z.infer<typeof CardGenerateRequestDTO>;

export const CardGenerateStatusQueryDTO = z
    .object({
        jobId: z.string().min(1),
        replaceOldest: z
            .union([z.boolean(), z.enum(['true', 'false'])])
            .optional()
            .transform((value) => {
                if (value === undefined) return undefined;
                if (typeof value === 'boolean') return value;
                return value === 'true';
            }),
    })
    .describe('CardGenerateStatusQueryDTO');
export type CardGenerateStatusQuery = z.infer<typeof CardGenerateStatusQueryDTO>;

export const PublishPageDTO = z
    .object({
        title: z.string().min(1).max(500),
        content: z.string().min(1).max(100_000),
        locale: z.string().min(2).max(10).optional(),
    })
    .describe('PublishPageDTO');
export type PublishPageBody = z.infer<typeof PublishPageDTO>;

/** Matches Strapi collection type `words` (JSON) — array or object payload */
export const PublishCollectionDTO = z
    .object({
        title: z.string().min(1).max(500),
        slug: z.string().min(1).max(300),
        words: z.union([z.array(z.unknown()), z.record(z.unknown())]),
        locale: z.string().min(2).max(10).optional(),
    })
    .describe('PublishCollectionDTO');
export type PublishCollectionBody = z.infer<typeof PublishCollectionDTO>;
