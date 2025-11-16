// src/services/openaiService.ts
import OpenAI from "openai";
import { getRandomTopic } from "./randomTopic";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!, // 🔑 возьми ключ из .env
});

// Тип входных данных (совпадает с GenerateJobInput)
export interface GenerateJobInput {
    target: string;
    lang: string;
    count: number;
    level?: string;
    translationLang?: string;
    userId?: string;
    traceId?: string;
}

// Тип результата (совпадает с GenerateJobResult)
export interface GenerateJobResult {
    sentences: Array<{ text: string; translation: string }>;
}

// Функция генерации предложений через OpenAI
export async function generateSentences(
    input: GenerateJobInput
): Promise<GenerateJobResult> {
    const {
        target,
        lang = "en",
        count = 3,
        level = "B2",
        translationLang = "ru",
    } = input;

// Additionally, provide translations to ${translationLang}.

    const topic = getRandomTopic(input.level as any);
    const system = `You are a helpful assistant that writes natural ${lang} example sentences at ${level} level.`;
    const user = `
Target word: "${target}"
Language: ${lang}
Level: ${level}
Topic: ${topic}
Count: ${count}

IMPORTANT CONSTRAINTS:
- Each sentence MUST clearly be about the topic: "${topic}".

Additionally, provide translations to Russian.
В translation сделай переведи на русский язык!
Return JSON with shape:
{
  "sentences": [
    { "text": "...", "translation": "..." }
  ]
}
Keep sentences diverse and natural; each must use the target word.
`;

    console.log('user === ', user);

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const res = await client.chat.completions.create({
        model,
        messages: [
            { role: "system", content: system },
            { role: "user", content: user },
        ],
        temperature: 0.7,
    });

    const text = res.choices?.[0]?.message?.content ?? "";

    // пробуем распарсить JSON из ответа
    try {
        const jsonStart = text.indexOf("{");
        const jsonStr = jsonStart >= 0 ? text.slice(jsonStart) : text;
        console.log('jsonStr === ', jsonStr);
        return JSON.parse(jsonStr) as GenerateJobResult;
    } catch {
        // fallback: если GPT вернул текст без JSON
        return { sentences: [{ text, translation: "" }] };
    }
}