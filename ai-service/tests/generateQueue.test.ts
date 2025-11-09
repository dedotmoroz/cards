import { beforeEach, describe, expect, it, vi } from "vitest";

const queueCtor = vi.fn();

vi.mock("../src/redis/connection", () => {
    return {
        redis: { mocked: true },
    };
});

vi.mock("bullmq", () => {
    return {
        Queue: vi.fn().mockImplementation((name: string, options: unknown) => {
            queueCtor(name, options);
            return { name, options };
        }),
    };
});

describe("generateQueue module", () => {
    beforeEach(() => {
        queueCtor.mockClear();
        vi.resetModules();
    });

    it("exports queue name constant", async () => {
        const { queueName } = await import("../src/queues/generateQueue");
        expect(queueName).toBe("generate");
    });

    it("creates queue instance with shared redis connection", async () => {
        const module = await import("../src/queues/generateQueue");

        expect(queueCtor).toHaveBeenCalledWith("generate", { connection: { mocked: true } });
        expect(module.generateQueue).toEqual({
            name: "generate",
            options: { connection: { mocked: true } },
        });
    });
});

