import { URL } from 'node:url';

const DEFAULT_AI_SERVICE_URL = 'http://localhost:4000';
const aiServiceBaseUrl = process.env.AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL;

interface FetchOptions extends RequestInit {
  expectedStatus?: number;
}

async function callAiService<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const url = new URL(path, aiServiceBaseUrl);
  const { expectedStatus = 200, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
  });

  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(
      `[ai-service] Unexpected status ${response.status} for ${url.href}. Body: ${body}`,
    );
  }

  return (await response.json()) as T;
}

export type GenerateRequestPayload = {
  target: string;
  lang: string;
  count: number;
  level?: string;
  translationLang?: string;
  userId?: string;
  traceId?: string;
};

export type GenerateJobResponse = {
  jobId: string;
};

export type GenerateJobStatusSentence = {
  text: string;
  translation: string;
};

export type GenerateJobStatusResponse = {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress: number;
  result: null | {
    sentences: GenerateJobStatusSentence[];
  };
  error?: string;
};

export async function requestGeneration(
  payload: GenerateRequestPayload,
): Promise<GenerateJobResponse> {
  return callAiService<GenerateJobResponse>('/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchGenerationStatus(jobId: string): Promise<GenerateJobStatusResponse> {
  return callAiService<GenerateJobStatusResponse>(`/jobs/${jobId}`, {
    method: 'GET',
  });
}

