import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
    const readFileSyncMock = vi.fn((filePath: string) => {
        if (filePath.includes("generateSystemPrompt.txt")) {
            return "System prompt for sentence generation";
        }
        if (filePath.includes("generateUserPrompt.txt")) {
            return "Word: {TARGET_WORD} sample: {TRANSLATION_SAMPLE} lang: {TARGET_LANGUAGE} translation: {TRANSLATION_LANGUAGE} level: {CEFR_LEVEL} count: {COUNT} topic: {TOPIC}";
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

vi.mock("../src/services/randomTopic", () => ({
    getRandomTopic: () => "daily life",
}));

import { generateSentences } from "../src/services/generateService";

describe("generateSentences", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "test-key";
        process.env.OPENAI_MODEL = "gpt-4o-mini";
        mocks.create.mockReset();
    });

    it("includes TARGET_LANGUAGE and TRANSLATION_LANGUAGE in user prompt", async () => {
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify({
                            sentences: [{ text: "Hello world", translation: "Привет мир" }],
                        }),
                    },
                },
            ],
        });

        await generateSentences({
            target: "hello",
            translationSample: "привет",
            lang: "en",
            translationLang: "ru",
            count: 1,
            level: "B1",
        });

        const userMessage = mocks.create.mock.calls[0][0].messages[1].content as string;
        expect(userMessage).toContain("lang: en");
        expect(userMessage).toContain("translation: ru");
        expect(userMessage).toContain("Word: hello");
        expect(userMessage).toContain("sample: привет");
    });

    it("falls back translation language to lang when translationLang is missing", async () => {
        mocks.create.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify({
                            sentences: [{ text: "Hallo", translation: "Hallo" }],
                        }),
                    },
                },
            ],
        });

        await generateSentences({
            target: "Hallo",
            lang: "de",
            count: 1,
        });

        const userMessage = mocks.create.mock.calls[0][0].messages[1].content as string;
        expect(userMessage).toContain("lang: de");
        expect(userMessage).toContain("translation: de");
    });
});
