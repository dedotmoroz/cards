import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const readFileSyncMock = vi.fn((filePath: string) => {
        if (filePath.includes("contextSystemPrompt.txt")) {
            return "System prompt for context generation";
        }
        if (filePath.includes("contextUserPrompt.txt")) {
            return "User prompt with {WORDS_LIST}, {TARGET_LANGUAGE}, {TRANSLATION_LANGUAGE}, {CEFR_LEVEL}";
        }
        return "";
    });
    
    return {
        generateText: vi.fn(),
        readFileSync: readFileSyncMock,
    };
});

vi.mock("ai", () => ({
    generateText: mocks.generateText,
}));

vi.mock("fs", () => ({
    default: {
        readFileSync: mocks.readFileSync,
    },
    readFileSync: mocks.readFileSync,
}));

vi.mock("path", () => ({
    default: {
        join: (...args: string[]) => args.join("/"),
    },
    join: (...args: string[]) => args.join("/"),
}));

import { generateContextText } from "../src/services/contextTextService";

describe("generateContextText", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "test-key";
        process.env.OPENAI_MODEL = "gpt-4o-mini";
        mocks.generateText.mockReset();
    });

    it("parses JSON response from OpenAI with text and translation", async () => {
        const expected = {
            text: "Hello world! This is a test sentence.",
            translation: "Привет мир! Это тестовое предложение.",
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        const result = await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            level: "B1",
            translationLang: "ru",
        });

        expect(result).toEqual(expected);
        expect(mocks.generateText).toHaveBeenCalledTimes(1);
        
        const callArgs = mocks.generateText.mock.calls[0][0];
        expect(callArgs.system).toBe("System prompt for context generation");
        expect(callArgs.prompt).toContain("en");
        expect(callArgs.temperature).toBe(0.7);
    });

    it("uses default translationLang when not provided", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Hello world test",
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        const result = await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
        });

        expect(result).toEqual(expected);
        
        const userPrompt = mocks.generateText.mock.calls[0][0].prompt;
        expect(userPrompt).toContain(", en");
    });

    it("uses default level B1 when not provided", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        const userPrompt = mocks.generateText.mock.calls[0][0].prompt;
        expect(userPrompt).toMatch(/, B1$/);
    });

    it("includes explicit target and translation languages in the prompt", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        const userPrompt = mocks.generateText.mock.calls[0][0].prompt;
        expect(userPrompt).toContain("en");
        expect(userPrompt).toContain("ru");
    });

    it("includes words list in the prompt", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
        };

        mocks.generateText.mockResolvedValue({
            text: JSON.stringify(expected),
        });

        await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        const userPrompt = mocks.generateText.mock.calls[0][0].prompt;
        expect(userPrompt).toContain('"hello" (привет)');
        expect(userPrompt).toContain('"world" (мир)');
    });

    it("handles JSON with extra text before the JSON object", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
        };

        mocks.generateText.mockResolvedValue({
            text: `Some text before\n${JSON.stringify(expected)}`,
        });

        const result = await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        expect(result).toEqual(expected);
    });

    it("throws error when response is missing text field", async () => {
        mocks.generateText.mockResolvedValue({
            text: JSON.stringify({
                translation: "Only translation",
            }),
        });

        await expect(
            generateContextText({
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                ],
                lang: "en",
                translationLang: "ru",
            })
        ).rejects.toThrow("Invalid response structure: missing text or translation");
    });

    it("throws error when response is missing translation field", async () => {
        mocks.generateText.mockResolvedValue({
            text: JSON.stringify({
                text: "Only text",
            }),
        });

        await expect(
            generateContextText({
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                ],
                lang: "en",
                translationLang: "ru",
            })
        ).rejects.toThrow("Invalid response structure: missing text or translation");
    });

    it("throws error when response is not valid JSON", async () => {
        mocks.generateText.mockResolvedValue({
            text: "This is not JSON at all",
        });

        await expect(
            generateContextText({
                words: [
                    { word: "hello", translation: "привет" },
                    { word: "world", translation: "мир" },
                    { word: "test", translation: "тест" },
                ],
                lang: "en",
                translationLang: "ru",
            })
        ).rejects.toThrow();
    });
});
