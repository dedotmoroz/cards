import { Queue } from "bullmq";
import { redis } from "../redis/connection";

export type ContextJobInput = {
    words: Array<{ word: string; translation: string }>;
    lang: string;
    level?: string;
    translationLang?: string;
    userId?: string;
    traceId?: string;
};

export type ContextJobResult = {
    text: string;
    translation: string;
};

export const queueName = "context";

// создаём очередь с подключением к уже существующему клиенту redis
export const contextQueue = new Queue<ContextJobInput, ContextJobResult>(
    queueName,
    { connection: redis }
);

