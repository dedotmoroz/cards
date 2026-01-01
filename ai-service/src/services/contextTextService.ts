// src/services/contextTextService.ts

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

// читаем файлы один раз при загрузке модуля
const systemPrompt = fs.readFileSync(
    path.join(__dirname, "../prompts/contextSystemPrompt.txt"),
    "utf8"
);

const userTemplate = fs.readFileSync(
    path.join(__dirname, "../prompts/contextUserPrompt.txt"),
    "utf8"
);

// утилита для подстановки значений в текстовый шаблон
function fillTemplate(template: string, values: Record<string, string>) {
    return template.replace(/\{([A-Z_]+)\}/g, (_, key) => values[key] || "");
}

export interface ContextJobInput {
    words: Array<{ word: string; translation: string }>;
    lang: string;
    level?: string;
    translationLang?: string;
}

export async function generateContextText(input: ContextJobInput) {
    const {
        words,
        lang = "en",
        level = "B1",
        translationLang,
    } = input;
    
    // Если translationLang не указан, используем lang по умолчанию
    const finalTranslationLang = translationLang || lang;

    // Формируем список слов для промпта
    const wordsList = words
        .map((w) => `- "${w.word}" (${w.translation})`)
        .join("\n");

    const userPrompt = fillTemplate(userTemplate, {
        WORDS_LIST: wordsList,
        TARGET_LANGUAGE: lang,
        TRANSLATION_LANGUAGE: finalTranslationLang,
        CEFR_LEVEL: level || "B1",
    });

    const res = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
    });

    const text = res.choices?.[0]?.message?.content ?? "";

    // пробуем распарсить JSON из ответа
    try {
        const jsonStart = text.indexOf("{");
        const jsonStr = jsonStart >= 0 ? text.slice(jsonStart) : text;
        const parsed = JSON.parse(jsonStr);

        console.log('parsed', parsed);
        
        // Валидация структуры ответа
        if (!parsed.text || !parsed.translation) {
            throw new Error("Invalid response structure: missing text or translation");
        }
        
        return {
            text: parsed.text,
            translation: parsed.translation,
        };
    } catch (error) {
        // fallback: если GPT вернул текст без JSON или неправильную структуру
        console.error("Failed to parse OpenAI response:", error);
        console.error("Response text:", text);
        throw new Error(`Failed to generate context text: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

