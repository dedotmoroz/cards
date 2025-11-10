import Fastify from "fastify";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    addMock: vi.fn(),
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
});

