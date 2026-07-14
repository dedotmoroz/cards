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
  translationSample?: string;
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
  queueType?: 'generate' | 'context';
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
  return callAiService<GenerateJobStatusResponse>(`/jobs/${jobId}?queue=generate`, {
    method: 'GET',
  });
}

// Типы для контекстного чтения
export type ContextRequestPayload = {
  words: Array<{ word: string; translation: string }>;
  lang: string;
  level?: string;
  translationLang?: string;
  userId?: string;
  traceId?: string;
};

export type ContextJobResponse = {
  jobId: string;
};

export type ContextJobStatusText = {
  text: string;
  translation: string;
  hasAudio?: boolean;
};

export type ContextJobStatusResponse = {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused' | 'not_found';
  progress: number;
  result: null | ContextJobStatusText;
  error?: string;
  queueType?: 'generate' | 'context';
};

export async function requestContextGeneration(
  payload: ContextRequestPayload,
): Promise<ContextJobResponse> {
  return callAiService<ContextJobResponse>('/generate-context', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchContextGenerationStatus(jobId: string): Promise<ContextJobStatusResponse> {
  return callAiService<ContextJobStatusResponse>(`/jobs/${jobId}?queue=context`, {
    method: 'GET',
  });
}

export async function fetchContextAudio(jobId: string): Promise<Response> {
  const url = new URL(`/jobs/${jobId}/audio?queue=context`, aiServiceBaseUrl);
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error(`[ai-service] Context audio not found for job ${jobId}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[ai-service] Unexpected status ${response.status} for ${url.href}. Body: ${body}`,
    );
  }

  return response;
}

export async function promoteContextAudio(
  jobId: string,
  artifactId: string,
): Promise<{ ok: boolean; hasAudio: boolean }> {
  return callAiService<{ ok: boolean; hasAudio: boolean }>(
    `/jobs/${jobId}/promote-audio`,
    {
      method: 'POST',
      body: JSON.stringify({ artifactId }),
    },
  );
}

export async function fetchContextArtifactAudio(artifactId: string): Promise<Response> {
  const url = new URL(`/artifacts/${artifactId}/audio`, aiServiceBaseUrl);
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error(`[ai-service] Context audio not found for artifact ${artifactId}`);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[ai-service] Unexpected status ${response.status} for ${url.href}. Body: ${body}`,
    );
  }

  return response;
}

export async function deleteContextArtifactAudio(
  artifactId: string,
): Promise<{ ok: boolean; deleted: boolean }> {
  return callAiService<{ ok: boolean; deleted: boolean }>(
    `/artifacts/${artifactId}/audio`,
    {
      method: 'DELETE',
    },
  );
}

