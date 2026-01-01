import { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateQueue, GenerateJobInput, GenerateJobResult } from "../queues/generateQueue.js";
import { contextQueue, ContextJobInput, ContextJobResult } from "../queues/contextQueue.js";
import { Job, QueueEvents } from "bullmq";
import { redis } from "../redis/connection.js";
import type { FastifySchema } from "fastify";

const queueEvents = new QueueEvents("generate", { connection: redis });
const contextQueueEvents = new QueueEvents("context", { connection: redis });
// (необязательно, но полезно) ловим ошибки слушателя
queueEvents.on("error", (err) => {
    console.error("[QueueEvents] error:", err);
});

contextQueueEvents.on("error", (err) => {
    console.error("[ContextQueueEvents] error:", err);
});

// тип тела запроса на генерацию
const GenerateBodySchema = z.object({
    target: z.string(),
    lang: z.string(),
    count: z.number().int().positive().max(20),
    level: z.string().optional(),
    translationLang: z.string().optional(),
    translationSample: z.string().optional(),
    userId: z.string().optional(),
    traceId: z.string().optional(),
});
type GenerateBody = z.infer<typeof GenerateBodySchema>;

const GenerateBodyJsonSchema = {
    type: "object",
    required: ["target", "lang", "count"],
    properties: {
        target: { type: "string", description: "Целевое слово или выражение для генерации" },
        lang: { type: "string", description: "Язык сгенерированных предложений (ISO код)" },
        count: {
            type: "integer",
            minimum: 1,
            maximum: 20,
            description: "Количество требуемых предложений (1-20)",
        },
        level: { type: "string", description: "Уровень владения языком (например, A2, B1, C1)" },
        translationLang: {
            type: "string",
            description: "Язык перевода предложений (ISO код)",
        },
        translationSample: {
            type: "string",
            description: "Пример перевода для контекста генерации",
        },
        userId: { type: "string", description: "Идентификатор пользователя, инициировавшего генерацию" },
        traceId: { type: "string", description: "Трейс-ID для корреляции запросов" },
    },
} as const;

const HealthRouteSchema = {
    tags: ["Meta"],
    summary: "Проверка доступности сервиса",
    response: {
        200: {
            type: "object",
            required: ["ok"],
            properties: {
                ok: { type: "boolean" },
            },
        },
    },
} as const;

const GenerateRouteSchema = {
    tags: ["Jobs"],
    summary: "Поставить задачу генерации",
    body: GenerateBodyJsonSchema,
    response: {
        200: {
            type: "object",
            required: ["jobId"],
            properties: {
                jobId: { type: "string", description: "Идентификатор поставленной задачи" },
            },
        },
    },
} as const;

const JobStatusSchema = {
    tags: ["Jobs"],
    summary: "Получить статус задачи генерации",
    params: {
        type: "object",
        required: ["id"],
        properties: {
            id: { type: "string", description: "Идентификатор задачи" },
        },
    },
    response: {
        200: {
            type: "object",
            required: ["id", "state", "progress", "result"],
            properties: {
                id: { type: "string" },
                state: {
                    type: "string",
                    enum: ["waiting", "active", "completed", "failed", "delayed", "paused"],
                },
                progress: { type: "number", minimum: 0, maximum: 100 },
                result: {
                    anyOf: [
                        {
                            type: "object",
                            required: ["sentences"],
                            properties: {
                                sentences: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        required: ["text", "translation"],
                                        properties: {
                                            text: { type: "string" },
                                            translation: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        {
                            type: "object",
                            required: ["text", "translation"],
                            properties: {
                                text: { type: "string" },
                                translation: { type: "string" },
                            },
                        },
                        { type: "null" },
                    ],
                },
                error: { type: "string", nullable: true },
            },
        },
        404: {
            type: "object",
            required: ["id", "state", "progress", "result", "error"],
            properties: {
                id: { type: "string" },
                state: { type: "string", enum: ["not_found"] },
                progress: { type: "number" },
                result: { type: "null" },
                error: { type: "string" },
            },
        },
    },
};

// тип тела запроса на генерацию контекстного текста
const ContextBodySchema = z.object({
    words: z.array(
        z.object({
            word: z.string().min(1),
            translation: z.string().min(1),
        })
    ).min(3).max(5),
    lang: z.string().min(1),
    level: z.string().optional(),
    translationLang: z.string().optional(),
    userId: z.string().optional(),
    traceId: z.string().optional(),
});
type ContextBody = z.infer<typeof ContextBodySchema>;

const ContextBodyJsonSchema = {
    type: "object",
    required: ["words", "lang"],
    properties: {
        words: {
            type: "array",
            minItems: 3,
            maxItems: 5,
            items: {
                type: "object",
                required: ["word", "translation"],
                properties: {
                    word: { type: "string", description: "Слово или фраза на изучаемом языке" },
                    translation: { type: "string", description: "Перевод слова или фразы" },
                },
            },
            description: "Массив слов для включения в текст (3-5 слов)",
        },
        lang: { type: "string", description: "Язык сгенерированного текста (ISO код)" },
        level: { type: "string", description: "Уровень владения языком (например, A2, B1, B2, C1, C2)" },
        translationLang: {
            type: "string",
            description: "Язык перевода текста (ISO код)",
        },
        userId: { type: "string", description: "Идентификатор пользователя, инициировавшего генерацию" },
        traceId: { type: "string", description: "Трейс-ID для корреляции запросов" },
    },
} as const;

const ContextRouteSchema = {
    tags: ["Jobs"],
    summary: "Поставить задачу генерации связного текста для контекстного чтения",
    body: ContextBodyJsonSchema,
    response: {
        200: {
            type: "object",
            required: ["jobId"],
            properties: {
                jobId: { type: "string", description: "Идентификатор поставленной задачи" },
            },
        },
    },
} as const;

export default async function registerApi(app: FastifyInstance) {
    // здоровье
    app.get("/health", {
        schema: HealthRouteSchema as unknown as FastifySchema,
        handler: async () => ({ ok: true }),
    });

    // положить задачу
    app.post<{ Body: GenerateBody; Reply: { jobId: string } }>("/generate", {
        schema: GenerateRouteSchema as unknown as FastifySchema,
        handler: async (req, reply) => {
            const data = GenerateBodySchema.parse(req.body);
            const job = await generateQueue.add("generate", data as GenerateJobInput, {
                removeOnComplete: 1000,
                removeOnFail: 1000,
                attempts: 2,
                backoff: { type: "exponential", delay: 1000 },
            });
            const jobId = job.id;
            if (!jobId) {
                throw new Error("generated job has no id");
            }
            return reply.send({ jobId });
        },
    });

    // статус задачи (работает для обеих очередей: generate и context)
    app.get<{
        Params: { id: string };
        Reply: {
            id: string;
            state: string;
            progress: number;
            result: GenerateJobResult | ContextJobResult | null;
            error?: string;
        };
    }>("/jobs/:id", {
        schema: JobStatusSchema as unknown as FastifySchema,
        handler: async (req, reply) => {
            const { id } = req.params;
            
            // Пробуем найти задачу в очереди generate
            let job = await Job.fromId<GenerateJobInput, GenerateJobResult>(generateQueue, id);
            
            // Если не найдена, пробуем в очереди context
            if (!job) {
                job = await Job.fromId<ContextJobInput, ContextJobResult>(contextQueue, id) as any;
            }

            if (!job) {
                return reply.code(404).send({
                    id,
                    state: "not_found",
                    progress: 0,
                    result: null,
                    error: "job not found",
                });
            }

            const state = await job.getState(); // waiting | active | completed | failed | delayed | paused
            const progress = typeof job.progress === "number" ? job.progress : 0;
            const result = state === "completed" ? (job.returnvalue as GenerateJobResult | ContextJobResult) : null;
            const failedReason = state === "failed" ? job.failedReason : undefined;

            return reply.send({ id, state, progress, result, error: failedReason });
        },
    });

    // генерация контекстного текста
    app.post<{ Body: ContextBody; Reply: { jobId: string } }>("/generate-context", {
        schema: ContextRouteSchema as unknown as FastifySchema,
        handler: async (req, reply) => {
            const data = ContextBodySchema.parse(req.body);
            const job = await contextQueue.add("context", data as ContextJobInput, {
                removeOnComplete: 1000,
                removeOnFail: 1000,
                attempts: 2,
                backoff: { type: "exponential", delay: 1000 },
            });
            const jobId = job.id;
            if (!jobId) {
                throw new Error("generated job has no id");
            }
            return reply.send({ jobId });
        },
    });
}