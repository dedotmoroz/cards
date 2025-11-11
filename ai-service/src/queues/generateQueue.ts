import { Queue } from "bullmq";
import { redis } from "../redis/connection";

export type GenerateJobInput = {
    target: string;
    lang: string;
    count: number;
    level?: string;
    translationLang?: string;
    userId?: string;
    traceId?: string;
};

export type GenerateJobResult = {
    sentences: Array<{ text: string; translation: string }>;
};

export const queueName = "generate";

// создаём очередь с подключением к уже существующему клиенту redis
export const generateQueue = new Queue<GenerateJobInput, GenerateJobResult>(
    queueName,
    { connection: redis }
);