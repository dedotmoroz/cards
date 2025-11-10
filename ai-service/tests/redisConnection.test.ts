import { describe, expect, it, vi, beforeEach } from "vitest";

const redisCtor = vi.fn();

vi.mock("ioredis", () => {
    return {
        default: vi.fn().mockImplementation((url: string, options: unknown) => {
            redisCtor(url, options);
            return { url, options };
        }),
    };
});

describe("redis connection", () => {
    beforeEach(() => {
        redisCtor.mockClear();
        vi.resetModules();
    });

    it("creates redis client with provided env url", async () => {
        process.env.REDIS_URL = "redis://example.org:9999";

        const { redis } = await import("../src/redis/connection");

        expect(redisCtor).toHaveBeenCalledWith("redis://example.org:9999", expect.any(Object));
        const options = redisCtor.mock.calls[0][1] as Record<string, unknown>;
        expect(options).toMatchObject({
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        });
    });

    it("falls back to default url when env not set", async () => {
        delete process.env.REDIS_URL;

        const { redis } = await import("../src/redis/connection");

        expect(redisCtor).toHaveBeenCalledWith("redis://127.0.0.1:6379", expect.any(Object));
        expect(redis).toEqual({
            url: "redis://127.0.0.1:6379",
            options: expect.any(Object),
        });
    });
});

