import fs from "fs";
import path from "path";
import OpenAI from "openai";

const OPENAI_TTS_MAX_INPUT_CHARS = 4096;
const DEFAULT_AUDIO_STORAGE_DIR = "./data/context-audio";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export function getAudioStorageDir(): string {
    return process.env.AUDIO_STORAGE_DIR ?? DEFAULT_AUDIO_STORAGE_DIR;
}

export function ensureAudioStorageDir(): void {
    fs.mkdirSync(getAudioStorageDir(), { recursive: true });
}

export function getAudioFilePath(jobId: string): string {
    return path.join(getAudioStorageDir(), `${jobId}.mp3`);
}

export function contextAudioFileExists(jobId: string): boolean {
    return fs.existsSync(getAudioFilePath(jobId));
}

export function createContextAudioReadStream(jobId: string): fs.ReadStream {
    return fs.createReadStream(getAudioFilePath(jobId));
}

export async function synthesizeContextAudio(
    jobId: string,
    text: string,
): Promise<boolean> {
    const trimmed = text.trim();
    if (!trimmed) {
        return false;
    }

    if (trimmed.length > OPENAI_TTS_MAX_INPUT_CHARS) {
        console.warn(
            `[context-audio] skip TTS for job ${jobId}: text length ${trimmed.length} exceeds ${OPENAI_TTS_MAX_INPUT_CHARS}`,
        );
        return false;
    }

    if (!process.env.OPENAI_API_KEY) {
        console.warn(`[context-audio] skip TTS for job ${jobId}: OPENAI_API_KEY is missing`);
        return false;
    }

    try {
        ensureAudioStorageDir();

        const response = await client.audio.speech.create({
            model: process.env.OPENAI_TTS_MODEL ?? "tts-1",
            voice: (process.env.OPENAI_TTS_VOICE ?? "nova") as
                | "alloy"
                | "echo"
                | "fable"
                | "onyx"
                | "nova"
                | "shimmer",
            input: trimmed,
            response_format: "mp3",
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(getAudioFilePath(jobId), buffer);
        return true;
    } catch (error) {
        console.error(
            `[context-audio] failed TTS for job ${jobId}:`,
            error instanceof Error ? error.message : error,
        );
        return false;
    }
}
