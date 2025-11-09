import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Job } from "bullmq";

const mocks = vi.hoisted(() => ({
    generateSentences: vi.fn(),
    redis: {},
}));

vi.mock("../src/services/openaiService", () => ({
    generateSentences: mocks.generateSentences,
}));

vi.mock("../src/redis/connection", () => ({
    redis: mocks.redis,
}));

vi.mock("bullmq", () => {
    return {
        Worker: class {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            constructor() {}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on() {}
        },
        Job: class {},
        Queue: class {},
    };
});

import { processGenerateJob } from "../src/workers/generateWorker";
import type { GenerateJobInput, GenerateJobResult } from "../src/queues/generateQueue";

describe("processGenerateJob", () => {
    beforeEach(() => {
        mocks.generateSentences.mockReset();
    });

    it("updates progress and returns generated sentences", async () => {
        const jobData: GenerateJobInput = {
            target: "example",
            lang: "en",
            count: 2,
        };
        const generated: GenerateJobResult = {
            sentences: [
                { text: "Example sentence 1", translation: "Пример 1" },
                { text: "Example sentence 2", translation: "Пример 2" },
            ],
        };

        mocks.generateSentences.mockResolvedValue(generated);

        const updateProgress = vi.fn().mockResolvedValue(undefined);

        const job = {
            data: jobData,
            updateProgress,
        } as unknown as Job<GenerateJobInput, GenerateJobResult>;

        const result = await processGenerateJob(job);

        expect(updateProgress).toHaveBeenCalledWith(5);
        expect(updateProgress).toHaveBeenCalledWith(100);
        expect(mocks.generateSentences).toHaveBeenCalledWith(jobData);
        expect(result).toEqual(generated);
    });
});

