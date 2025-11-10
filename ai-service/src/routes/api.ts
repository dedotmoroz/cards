import { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateQueue, GenerateJobInput, GenerateJobResult } from "../queues/generateQueue.js";
import { Job, QueueEvents } from "bullmq";
import { redis } from "../redis/connection.js";
import type { FastifySchema } from "fastify";

const queueEvents = new QueueEvents("generate", { connection: redis });
// (необязательно, но полезно) ловим ошибки слушателя
queueEvents.on("error", (err) => {
    console.error("[QueueEvents] error:", err);
});

// тип тела запроса на генерацию
const GenerateBodySchema = z.object({
    target: z.string(),
    lang: z.string(),
    count: z.number().int().positive().max(20),
    level: z.string().optional(),
    translationLang: z.string().optional(),
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

    // статус задачи
    app.get<{
        Params: { id: string };
        Reply: {
            id: string;
            state: string;
            progress: number;
            result: GenerateJobResult | null;
            error?: string;
        };
    }>("/jobs/:id", {
        schema: JobStatusSchema as unknown as FastifySchema,
        handler: async (req, reply) => {
            const { id } = req.params;
            const job = await Job.fromId<GenerateJobInput, GenerateJobResult>(generateQueue, id);

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
            const result = state === "completed" ? (job.returnvalue as GenerateJobResult) : null;
            const failedReason = state === "failed" ? job.failedReason : undefined;

            return reply.send({ id, state, progress, result, error: failedReason });
        },
    });
}