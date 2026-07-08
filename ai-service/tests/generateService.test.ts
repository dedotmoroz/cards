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

vi.mock("../src/services/randomTopic", () => ({
    getRandomTopic: () => "daily life",
}));

import { generateSentences } from "../src/services/generateService";

describe("generateSentences", () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = "test-key";
        process.env.OPENAI_MODEL = "gpt-4o-mini";
        mocks.generateText.mockReset();
    });

    it("includes TARGET_LANGUAGE and TRANSLATION_LANGUAGE in user prompt", async () => {
        mocks.generateText.mockResolvedValue({
            text: JSON.stringify({
                sentences: [{ text: "Hello world", translation: "Привет мир" }],
            }),
        });

        await generateSentences({
            target: "hello",
            translationSample: "привет",
            lang: "en",
            translationLang: "ru",
            count: 1,
            level: "B1",
        });

        const userPrompt = mocks.generateText.mock.calls[0][0].prompt as string;
        expect(userPrompt).toContain("lang: en");
        expect(userPrompt).toContain("translation: ru");
        expect(userPrompt).toContain("Word: hello");
        expect(userPrompt).toContain("sample: привет");
    });

    it("falls back translation language to lang when translationLang is missing", async () => {
        mocks.generateText.mockResolvedValue({
            text: JSON.stringify({
                sentences: [{ text: "Hallo", translation: "Hallo" }],
            }),
        });

        await generateSentences({
            target: "Hallo",
            lang: "de",
            count: 1,
        });

        const userPrompt = mocks.generateText.mock.calls[0][0].prompt as string;
        expect(userPrompt).toContain("lang: de");
        expect(userPrompt).toContain("translation: de");
    });
});
