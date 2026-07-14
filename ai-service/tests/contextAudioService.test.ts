import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    speechCreate: vi.fn(),
}));

vi.mock("openai", () => ({
    default: class OpenAI {
        audio = {
            speech: {
                create: mocks.speechCreate,
            },
        };
    },
}));

import {
    contextAudioFileExists,
    getAudioFilePath,
    promoteContextAudio,
    deleteContextAudioFile,
    synthesizeContextAudio,
} from "../src/services/contextAudioService";

describe("contextAudioService", () => {
    let tempDir: string;

    beforeEach(() => {
        tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "context-audio-test-"));
        process.env.AUDIO_STORAGE_DIR = tempDir;
        process.env.OPENAI_API_KEY = "test-key";
        mocks.speechCreate.mockReset();
    });

    afterEach(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        delete process.env.AUDIO_STORAGE_DIR;
    });

    it("writes mp3 file when OpenAI returns audio", async () => {
        mocks.speechCreate.mockResolvedValue({
            arrayBuffer: async () => Uint8Array.from([1, 2, 3, 4]).buffer,
        });

        const ok = await synthesizeContextAudio("job-1", "Hello world");

        expect(ok).toBe(true);
        expect(contextAudioFileExists("job-1")).toBe(true);
        expect(fs.readFileSync(getAudioFilePath("job-1"))).toEqual(Buffer.from([1, 2, 3, 4]));
        expect(mocks.speechCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                input: "Hello world",
                response_format: "mp3",
            }),
        );
    });

    it("returns false when text exceeds OpenAI limit", async () => {
        const ok = await synthesizeContextAudio("job-2", "a".repeat(4097));

        expect(ok).toBe(false);
        expect(mocks.speechCreate).not.toHaveBeenCalled();
    });

    it("returns false when OpenAI fails", async () => {
        mocks.speechCreate.mockRejectedValue(new Error("tts failed"));

        const ok = await synthesizeContextAudio("job-3", "Hello");

        expect(ok).toBe(false);
        expect(contextAudioFileExists("job-3")).toBe(false);
    });

    it("promotes job audio to artifact id", () => {
        fs.writeFileSync(getAudioFilePath("job-4"), Buffer.from([9, 8, 7]));

        expect(promoteContextAudio("job-4", "artifact-4")).toBe(true);
        expect(contextAudioFileExists("artifact-4")).toBe(true);
        expect(fs.readFileSync(getAudioFilePath("artifact-4"))).toEqual(Buffer.from([9, 8, 7]));
        expect(contextAudioFileExists("job-4")).toBe(true);
    });

    it("returns false when promoting missing job audio", () => {
        expect(promoteContextAudio("missing", "artifact-x")).toBe(false);
        expect(contextAudioFileExists("artifact-x")).toBe(false);
    });

    it("deletes artifact audio file", () => {
        fs.writeFileSync(getAudioFilePath("artifact-del"), Buffer.from([1]));
        expect(deleteContextAudioFile("artifact-del")).toBe(true);
        expect(contextAudioFileExists("artifact-del")).toBe(false);
        expect(deleteContextAudioFile("artifact-del")).toBe(false);
    });
});
