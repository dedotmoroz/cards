import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "../redis/connection";
import { queueName, GenerateJobInput, GenerateJobResult } from "../queues/generateQueue";
import { generateSentences } from "../services/openaiService"; // 👈 вот это добавляем

// (заглушка) генерация предложений.
// Здесь позже подключишь реальный вызов модели (OpenAI и т.п.)
// async function generateSentences(input: GenerateJobInput): Promise<string[]> {
//     const { target, lang, count, level, translationLang } = input;
//
//     // эмуляция “долгой” операции и прогресса
//     const items: string[] = [];
//     for (let i = 1; i <= count; i++) {
//         await new Promise(r => setTimeout(r, 400));
//         items.push(`[${lang}] (${level ?? "B2"}) ${i}. Example with "${target}" ${translationLang ? `(→ ${translationLang})` : ""}`.trim());
//     }
//     return items;
// }

export async function processGenerateJob(job: Job<GenerateJobInput, GenerateJobResult>) {
    await job.updateProgress(5);
    const result = await generateSentences(job.data);
    await job.updateProgress(100);
    return result;
}

const worker = new Worker<GenerateJobInput, GenerateJobResult>(
    queueName,
    processGenerateJob,
    { connection: redis }
);

worker.on("completed", (job) => {
    console.log(`[worker] completed job ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`[worker] failed job ${job?.id}:`, err?.message);
});