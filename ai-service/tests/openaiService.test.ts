import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    generateText: vi.fn(),
}));

vi.mock("ai", () => ({
    generateText: mocks.generateText,
}));

import { generateSentences } from "../src/services/generateService";

describe("generateSentences", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "test-key";
        mocks.generateText.mockReset();
    });

    it("parses JSON response from OpenAI", async () => {
        const expected = {
            sentences: [{ text: "Hello", translation: "Привет" }],
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        const result = await generateSentences({
            target: "hello",
            lang: "en",
            count: 1,
        });

        expect(result).toEqual(expected);
        expect(mocks.generateText).toHaveBeenCalledTimes(1);
    });

    it("falls back to text when JSON cannot be parsed", async () => {
        mocks.generateText.mockResolvedValue({
            text: "non-json response",
        });

        const result = await generateSentences({
            target: "world",
            lang: "en",
            count: 1,
        });

        expect(result.sentences).toHaveLength(1);
        expect(result.sentences[0].text).toBe("non-json response");
    });
});
