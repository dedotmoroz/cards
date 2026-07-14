import Fastify from "fastify";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    addMock: vi.fn(),
    addContextMock: vi.fn(),
    jobFromIdMock: vi.fn(),
    contextAudioFileExists: vi.fn(),
    createContextAudioReadStream: vi.fn(),
    promoteContextAudio: vi.fn(),
    deleteContextAudioFile: vi.fn(),
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

vi.mock("../src/services/contextAudioService", () => ({
    contextAudioFileExists: mocks.contextAudioFileExists,
    createContextAudioReadStream: mocks.createContextAudioReadStream,
    promoteContextAudio: mocks.promoteContextAudio,
    deleteContextAudioFile: mocks.deleteContextAudioFile,
}));

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
        mocks.contextAudioFileExists.mockReset();
        mocks.createContextAudioReadStream.mockReset();
        mocks.promoteContextAudio.mockReset();
        mocks.deleteContextAudioFile.mockReset();
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
            url: "/jobs/job-321?queue=generate",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({
            id: "job-321",
            state: "completed",
            progress: 100,
            result: { sentences: [{ text: "hi", translation: "привет" }] },
            queueType: "generate",
        });
        expect(mocks.jobFromIdMock).toHaveBeenCalledTimes(1);

        await app.close();
    });

    it("returns generate job when queue=generate even if context job shares the same id", async () => {
        const generateJobStub = {
            id: "234",
            getState: vi.fn().mockResolvedValue("completed"),
            progress: 100,
            returnvalue: {
                sentences: [
                    {
                        text: "In the city, being self-driven is important.",
                        translation: "В городе быть самостоятельным важно.",
                    },
                ],
            },
        };
        mocks.jobFromIdMock.mockResolvedValue(generateJobStub);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/234?queue=generate",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().queueType).toBe("generate");
        expect(response.json().result.sentences).toHaveLength(1);
        expect(mocks.jobFromIdMock).toHaveBeenCalledTimes(1);

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
        
        let callCount = 0;
        mocks.jobFromIdMock.mockImplementation(async () => {
            callCount++;
            if (callCount === 1) return jobStub;
            return null;
        });

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/context-job-456?queue=context",
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
            queueType: "context",
        });
        expect(mocks.jobFromIdMock).toHaveBeenCalledTimes(1);

        await app.close();
    });

    it("streams context audio when job is completed and file exists", async () => {
        const jobStub = {
            id: "context-job-audio",
            getState: vi.fn().mockResolvedValue("completed"),
            returnvalue: {
                text: "Hello world test",
                translation: "Привет мир тест",
                hasAudio: true,
            },
        };
        mocks.jobFromIdMock.mockResolvedValue(jobStub);
        mocks.contextAudioFileExists.mockReturnValue(true);
        mocks.createContextAudioReadStream.mockReturnValue(
            Readable.from([Buffer.from("fake-mp3")]),
        );

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/context-job-audio/audio?queue=context",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toBe("audio/mpeg");
        expect(response.rawPayload).toEqual(Buffer.from("fake-mp3"));

        await app.close();
    });

    it("returns 404 for context audio when file is missing", async () => {
        const jobStub = {
            id: "context-job-no-audio",
            getState: vi.fn().mockResolvedValue("completed"),
            returnvalue: {
                text: "Hello world test",
                translation: "Привет мир тест",
                hasAudio: false,
            },
        };
        mocks.jobFromIdMock.mockResolvedValue(jobStub);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/jobs/context-job-no-audio/audio?queue=context",
        });

        expect(response.statusCode).toBe(404);
        expect(response.json()).toEqual({ error: "audio not found" });

        await app.close();
    });

    it("promotes job audio to artifact id", async () => {
        mocks.promoteContextAudio.mockReturnValue(true);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "POST",
            url: "/jobs/context-job-1/promote-audio",
            payload: { artifactId: "artifact-1" },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ ok: true, hasAudio: true });
        expect(mocks.promoteContextAudio).toHaveBeenCalledWith("context-job-1", "artifact-1");

        await app.close();
    });

    it("streams artifact audio without bullmq job", async () => {
        mocks.contextAudioFileExists.mockReturnValue(true);
        mocks.createContextAudioReadStream.mockReturnValue(
            Readable.from([Buffer.from("artifact-mp3")]),
        );

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "GET",
            url: "/artifacts/artifact-1/audio",
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toBe("audio/mpeg");
        expect(response.rawPayload).toEqual(Buffer.from("artifact-mp3"));
        expect(mocks.jobFromIdMock).not.toHaveBeenCalled();

        await app.close();
    });

    it("deletes artifact audio file", async () => {
        mocks.deleteContextAudioFile.mockReturnValue(true);

        const app = Fastify();
        await registerApi(app);

        const response = await app.inject({
            method: "DELETE",
            url: "/artifacts/artifact-1/audio",
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ ok: true, deleted: true });
        expect(mocks.deleteContextAudioFile).toHaveBeenCalledWith("artifact-1");

        await app.close();
    });
});

