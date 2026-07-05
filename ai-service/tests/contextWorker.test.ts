import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Job } from "bullmq";

const mocks = vi.hoisted(() => ({
    generateContextText: vi.fn(),
    synthesizeContextAudio: vi.fn(),
    redis: {},
}));

vi.mock("../src/services/contextTextService", () => ({
    generateContextText: mocks.generateContextText,
}));

vi.mock("../src/services/contextAudioService", () => ({
    synthesizeContextAudio: mocks.synthesizeContextAudio,
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

import { processContextJob } from "../src/workers/contextWorker";
import type { ContextJobInput, ContextJobResult } from "../src/queues/contextQueue";

describe("processContextJob", () => {
    beforeEach(() => {
        mocks.generateContextText.mockReset();
        mocks.synthesizeContextAudio.mockReset();
    });

    it("updates progress and returns generated context text with audio", async () => {
        const jobData: ContextJobInput = {
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            level: "B1",
            translationLang: "ru",
        };
        const generated = {
            text: "Hello world! This is a test sentence.",
            translation: "Привет мир! Это тестовое предложение.",
        };

        mocks.generateContextText.mockResolvedValue(generated);
        mocks.synthesizeContextAudio.mockResolvedValue(true);

        const updateProgress = vi.fn().mockResolvedValue(undefined);

        const job = {
            id: "job-123",
            data: jobData,
            updateProgress,
        } as unknown as Job<ContextJobInput, ContextJobResult>;

        const result = await processContextJob(job);

        expect(updateProgress).toHaveBeenCalledWith(5);
        expect(updateProgress).toHaveBeenCalledWith(60);
        expect(updateProgress).toHaveBeenCalledWith(100);
        expect(mocks.generateContextText).toHaveBeenCalledWith(jobData);
        expect(mocks.synthesizeContextAudio).toHaveBeenCalledWith(
            "job-123",
            generated.text,
        );
        expect(result).toEqual({ ...generated, hasAudio: true });
    });

    it("returns hasAudio false when TTS fails", async () => {
        const jobData: ContextJobInput = {
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
        };
        const generated = {
            text: "Hello world test",
            translation: "Hello world test",
        };

        mocks.generateContextText.mockResolvedValue(generated);
        mocks.synthesizeContextAudio.mockResolvedValue(false);

        const job = {
            id: "job-456",
            data: jobData,
            updateProgress: vi.fn().mockResolvedValue(undefined),
        } as unknown as Job<ContextJobInput, ContextJobResult>;

        const result = await processContextJob(job);

        expect(result).toEqual({ ...generated, hasAudio: false });
    });

    it("handles job without optional fields", async () => {
        const jobData: ContextJobInput = {
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
        };
        const generated = {
            text: "Hello world test",
            translation: "Hello world test",
        };

        mocks.generateContextText.mockResolvedValue(generated);
        mocks.synthesizeContextAudio.mockResolvedValue(true);

        const updateProgress = vi.fn().mockResolvedValue(undefined);

        const job = {
            id: "job-789",
            data: jobData,
            updateProgress,
        } as unknown as Job<ContextJobInput, ContextJobResult>;

        const result = await processContextJob(job);

        expect(result).toEqual({ ...generated, hasAudio: true });
        expect(mocks.generateContextText).toHaveBeenCalledWith(jobData);
    });
});
