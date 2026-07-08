import { generateText, type LanguageModel } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

type MLProvider = "openai" | "deepseek";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const deepseek = createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
});

export function resolveModel(): LanguageModel {
    const provider = (process.env.ML_PROVIDER ?? "openai") as MLProvider;

    if (provider === "deepseek") {
        return deepseek.chat(process.env.DEEPSEEK_MODEL ?? "deepseek-chat");
    }

    return openai(process.env.OPENAI_MODEL ?? "gpt-4o-mini");
}

export async function generateChatText(params: {
    system: string;
    prompt: string;
    temperature?: number;
}): Promise<string> {
    const { text } = await generateText({
        model: resolveModel(),
        system: params.system,
        prompt: params.prompt,
        temperature: params.temperature ?? 0.7,
    });
    return text;
}
