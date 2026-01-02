import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    create: vi.fn(),
}));

vi.mock("openai", () => ({
    default: class {
        chat = {
            completions: {
                create: mocks.create,
            },
        };
        constructor() {
            // set in tests if needed
        }
    },
}));

import { generateSentences } from "../src/services/generateService";

describe("generateSentences", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "test-key";
        mocks.create.mockReset();
    });

    it("parses JSON response from OpenAI", async () => {
        const expected = {
            sentences: [{ text: "Hello", translation: "Привет" }],
        };

        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify(expected),
                    },
                },
            ],
        });

        const result = await generateSentences({
            target: "hello",
            lang: "en",
            count: 1,
        });

        expect(result).toEqual(expected);
        expect(mocks.create).toHaveBeenCalledTimes(1);
    });

    it("falls back to text when JSON cannot be parsed", async () => {
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: "non-json response",
                    },
                },
            ],
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

