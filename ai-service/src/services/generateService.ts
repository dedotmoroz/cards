import fs from "fs";
import path from "path";
import { getRandomTopic } from "./randomTopic";
import type { Level } from "./topics";
import { generateChatText } from "./llm";

// читаем файлы один раз при загрузке модуля
const systemPrompt = fs.readFileSync(
    path.join(__dirname, "../prompts/generateSystemPrompt.txt"),
    "utf8"
);

const userTemplate = fs.readFileSync(
    path.join(__dirname, "../prompts/generateUserPrompt.txt"),
    "utf8"
);

// утилита для подстановки значений в текстовый шаблон
function fillTemplate(template: string, values: Record<string, string>) {
    return template.replace(/\{([A-Z_]+)\}/g, (_, key) => values[key] || "");
}

export interface GenerateJobInput {
    target: string;
    translationSample?: string;
    lang: string;
    count: number;
    level?: string;
    translationLang?: string;
}

export async function generateSentences(input: GenerateJobInput) {
    const {
        target,
        translationSample = "",
        lang = "en",
        count = 3,
        level = "B2",
        translationLang,
    } = input;

    const finalTranslationLang = translationLang || lang;
    const topic = getRandomTopic(level as Level);

    const userPrompt = fillTemplate(userTemplate, {
        TARGET_WORD: target,
        TARGET_LANGUAGE: lang,
        TRANSLATION_LANGUAGE: finalTranslationLang,
        CEFR_LEVEL: level,
        COUNT: String(count),
        TOPIC: topic,
        TRANSLATION_SAMPLE: translationSample || "",
    });

    const text = await generateChatText({
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
    });

    // пробуем распарсить JSON из ответа
    try {
        const jsonStart = text.indexOf("{");
        const jsonStr = jsonStart >= 0 ? text.slice(jsonStart) : text;
        console.log('jsonStr === ', jsonStr);
        return JSON.parse(jsonStr);
    } catch {
        // fallback: если GPT вернул текст без JSON
        return { sentences: [{ text, translation: "" }] };
    }
}