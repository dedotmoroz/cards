import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "../redis/connection";
import { queueName, ContextJobInput, ContextJobResult } from "../queues/contextQueue";
import { generateContextText } from "../services/contextTextService";

export async function processContextJob(job: Job<ContextJobInput, ContextJobResult>) {
    await job.updateProgress(5);
    const { text, translation } = await generateContextText(job.data);
    await job.updateProgress(60);

    // В ручном режиме аудио создаётся отдельно по кнопке.
    await job.updateProgress(100);
    return { text, translation, hasAudio: false };
}

const worker = new Worker<ContextJobInput, ContextJobResult>(
    queueName,
    processContextJob,
    { connection: redis }
);

worker.on("completed", (job) => {
    console.log(`[context-worker] completed job ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`[context-worker] failed job ${job?.id}:`, err?.message);
});
