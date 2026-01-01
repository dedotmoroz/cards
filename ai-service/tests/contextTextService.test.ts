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
        create: vi.fn(),
        readFileSync: readFileSyncMock,
    };
});

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
        mocks.create.mockReset();
    });

    it("parses JSON response from OpenAI with text and translation", async () => {
        const expected = {
            text: "Hello world! This is a test sentence.",
            translation: "Привет мир! Это тестовое предложение.",
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
        expect(mocks.create).toHaveBeenCalledTimes(1);
        
        const callArgs = mocks.create.mock.calls[0][0];
        expect(callArgs.model).toBe("gpt-4o-mini");
        expect(callArgs.messages).toHaveLength(2);
        expect(callArgs.messages[0].role).toBe("system");
        expect(callArgs.messages[1].role).toBe("user");
        expect(callArgs.temperature).toBe(0.7);
    });

    it("uses default translationLang when not provided", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Hello world test",
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

        const result = await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
        });

        expect(result).toEqual(expected);
        
        const userPrompt = mocks.create.mock.calls[0][0].messages[1].content;
        // Проверяем, что translationLang используется (по умолчанию равен lang)
        // В упрощенном моке значения просто добавляются в конец, проверяем наличие "en"
        expect(userPrompt).toContain(", en");
    });

    it("uses default level B1 when not provided", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
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

        await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
                { word: "test", translation: "тест" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        const userPrompt = mocks.create.mock.calls[0][0].messages[1].content;
        // Проверяем, что level B1 используется (по умолчанию)
        // В упрощенном моке значения просто добавляются в конец, проверяем наличие "B1"
        expect(userPrompt).toMatch(/, B1$/);
    });

    it("includes words list in the prompt", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
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

        await generateContextText({
            words: [
                { word: "hello", translation: "привет" },
                { word: "world", translation: "мир" },
            ],
            lang: "en",
            translationLang: "ru",
        });

        const userPrompt = mocks.create.mock.calls[0][0].messages[1].content;
        expect(userPrompt).toContain('"hello" (привет)');
        expect(userPrompt).toContain('"world" (мир)');
    });

    it("handles JSON with extra text before the JSON object", async () => {
        const expected = {
            text: "Hello world test",
            translation: "Привет мир тест",
        };

        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: `Some text before\n${JSON.stringify(expected)}`,
                    },
                },
            ],
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
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify({
                            translation: "Only translation",
                        }),
                    },
                },
            ],
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
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify({
                            text: "Only text",
                        }),
                    },
                },
            ],
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
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: "This is not JSON at all",
                    },
                },
            ],
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
