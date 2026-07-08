import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    generateText: vi.fn(),
    google: vi.fn((model: string) => ({ provider: "google", model })),
    openaiFactory: vi.fn((model: string) => ({ provider: "openai", model })),
    deepseekFactory: vi.fn((model: string) => ({ provider: "deepseek", model })),
}));

vi.mock("ai", () => ({
    generateText: mocks.generateText,
}));

vi.mock("@ai-sdk/google", () => ({
    google: mocks.google,
}));

vi.mock("@ai-sdk/openai", () => ({
    createOpenAI: vi.fn((config: { baseURL?: string }) => {
        if (config.baseURL?.includes("deepseek")) {
            return Object.assign(mocks.deepseekFactory, { chat: mocks.deepseekFactory });
        }
        return mocks.openaiFactory;
    }),
}));

describe("resolveModel", () => {
    beforeEach(() => {
        vi.resetModules();
        delete process.env.ML_PROVIDER;
        delete process.env.OPENAI_MODEL;
        delete process.env.DEEPSEEK_MODEL;
        delete process.env.GOOGLE_MODEL;
        mocks.google.mockClear();
        mocks.openaiFactory.mockClear();
        mocks.deepseekFactory.mockClear();
    });

    it("uses Google when ML_PROVIDER=google", async () => {
        process.env.ML_PROVIDER = "google";
        process.env.GOOGLE_MODEL = "gemini-2.0-flash";

        const { resolveModel } = await import("../src/services/llm");
        resolveModel();

        expect(mocks.google).toHaveBeenCalledWith("gemini-2.0-flash");
    });

    it("uses default Google model when GOOGLE_MODEL is missing", async () => {
        process.env.ML_PROVIDER = "google";

        const { resolveModel } = await import("../src/services/llm");
        resolveModel();

        expect(mocks.google).toHaveBeenCalledWith("gemini-2.0-flash");
    });

    it("uses DeepSeek chat when ML_PROVIDER=deepseek", async () => {
        process.env.ML_PROVIDER = "deepseek";
        process.env.DEEPSEEK_MODEL = "deepseek-v4-flash";

        const { resolveModel } = await import("../src/services/llm");
        resolveModel();

        expect(mocks.deepseekFactory).toHaveBeenCalledWith("deepseek-v4-flash");
    });
});

describe("generateChatText", () => {
    beforeEach(() => {
        process.env.ML_PROVIDER = "google";
        mocks.generateText.mockReset();
        mocks.generateText.mockResolvedValue({ text: "ok" });
    });

    it("calls generateText with resolved model", async () => {
        const { generateChatText } = await import("../src/services/llm");

        const result = await generateChatText({
            system: "system",
            prompt: "prompt",
        });

        expect(result).toBe("ok");
        expect(mocks.generateText).toHaveBeenCalledTimes(1);
    });
});
