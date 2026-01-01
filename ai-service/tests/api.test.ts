import Fastify from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    addMock: vi.fn(),
    addContextMock: vi.fn(),
    jobFromIdMock: vi.fn(),
}));

vi.mock("../src/queues/generateQueue", () => {
    return {
        generateQueue: {
            add: mocks.addMock,
        },
        queueName: "generate",
    };
});

vi.mock("../src/queues/contextQueue", () => {
    return {
        contextQueue: {
            add: mocks.addContextMock,
        },
        queueName: "context",
    };
});

vi.mock("bullmq", () => {
    return {
        QueueEvents: class {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            constructor() {}
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            on() {}
        },
        Job: {
            fromId: mocks.jobFromIdMock,
        },
    };
});

import registerApi from "../src/routes/api";

describe("API routes", () => {
    beforeEach(() => {
        mocks.addMock.mockReset();
        mocks.addContextMock.mockReset();
        mocks.jobFromIdMock.mockReset();
    });

    it("enqueues generate job and returns job id", async () => {
        mocks.addMock.mockResolvedValue({ id: "job-123" });

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/generate",
            payload: {
                target: "example",
                lang: "en",
                count: 1,
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ jobId: "job-123" });
        expect(mocks.addMock).toHaveBeenCalledTimes(1);
        expect(mocks.addMock.mock.calls[0][0]).toBe("generate");

        await app.close();
    });

    it("returns job status when job exists", async () => {
        const jobStub = {
            id: "job-321",
            getState: vi.fn().mockResolvedValue("completed"),
            progress: 100,
            returnvalue: { sentences: [{ text: "hi", translation: "привет" }] },
        };
        mocks.jobFromIdMock.mockResolvedValue(jobStub);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/job-321",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            id: "job-321",
            state: "completed",
            progress: 100,
            result: { sentences: [{ text: "hi", translation: "привет" }] },
            error: undefined,
        });

        await app.close();
    });

    it("returns 404 when job is missing", async () => {
        mocks.jobFromIdMock.mockResolvedValue(null);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/missing",
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({
            id: "missing",
            state: "not_found",
            progress: 0,
            result: null,
            error: "job not found",
        });

        await app.close();
    });

    it("enqueues context generation job and returns job id", async () => {
        mocks.addContextMock.mockResolvedValue({ id: "context-job-123" });

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/generate-context",
            payload: {
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                ],
                lang: "en",
                level: "B1",
                translationLang: "ru",
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ jobId: "context-job-123" });
        expect(mocks.addContextMock).toHaveBeenCalledTimes(1);
        expect(mocks.addContextMock.mock.calls[0][0]).toBe("context");
        expect(mocks.addContextMock.mock.calls[0][1]).toEqual({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            level: "B1",
            translationLang: "ru",
        });

        await app.close();
    });

    it("validates context request body - requires at least 3 words", async () => {
        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/generate-context",
            payload: {
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                ],
                lang: "en",
            },
        });

        expect(response.statusCode).toBe(400);
        await app.close();
    });

    it("validates context request body - requires at most 5 words", async () => {
        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/generate-context",
            payload: {
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                    { word: "four", translation: "четыре" },
                    { word: "five", translation: "пять" },
                    { word: "six", translation: "шесть" },
                ],
                lang: "en",
            },
        });

        expect(response.statusCode).toBe(400);
        await app.close();
    });

    it("validates context request body - requires lang", async () => {
        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/generate-context",
            payload: {
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                ],
            },
        });

        expect(response.statusCode).toBe(400);
        await app.close();
    });

    it("returns job status for context job when job exists", async () => {
        const jobStub = {
            id: "context-job-456",
            getState: vi.fn().mockResolvedValue("completed"),
            progress: 100,
            returnvalue: {
                text: "Hello world test",
                translation: "Привет мир тест",
            },
        };
        
        // Первый вызов (generate queue) вернет null, второй (context queue) вернет job
        let callCount = 0;
        mocks.jobFromIdMock.mockImplementation(async (queue, id) => {
            callCount++;
            if (callCount === 1) {
                // Первый вызов для generate queue
                return null;
            }
            // Второй вызов для context queue
            return jobStub;
        });

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/context-job-456",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            id: "context-job-456",
            state: "completed",
            progress: 100,
            result: {
                text: "Hello world test",
                translation: "Привет мир тест",
            },
            error: undefined,
        });
        expect(mocks.jobFromIdMock).toHaveBeenCalledTimes(2);

        await app.close();
    });
});

