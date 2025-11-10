// src/redis/connection.ts
import IORedis from "ioredis";

const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

// Один общий инстанс для всего приложения (Queue, Worker, QueueEvents)
export const redis = new IORedis(url, {
    // Требования BullMQ:
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // необязательно, но полезно для стабильности:
    // retryStrategy: (times) => Math.min(times * 50, 2000),
});