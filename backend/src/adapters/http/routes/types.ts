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
    })
    .describe('CardGenerateRequestDTO');
export type CardGenerateRequestInput = z.infer<typeof CardGenerateRequestDTO>;

export const CardGenerateStatusQueryDTO = z
    .object({
        jobId: z.string().min(1),
    })
    .describe('CardGenerateStatusQueryDTO');
export type CardGenerateStatusQuery = z.infer<typeof CardGenerateStatusQueryDTO>;
