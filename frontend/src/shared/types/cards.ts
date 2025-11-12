export interface Folder {
  id: string;
  name: string;
  userId: string;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  questionSentences?: string;
  answerSentences?: string;
  isLearned: boolean;
  folderId: string;
}

export interface CreateCardData {
  question: string;
  answer: string;
  folderId: string;
  questionSentences?: string;
  answerSentences?: string;
}

export interface UpdateCardData {
  question?: string;
  answer?: string;
  questionSentences?: string | null;
  answerSentences?: string | null;
}

export interface UpdateCardLearnStatusData {
  isLearned: boolean;
}

export interface CardGenerationRequest {
  lang?: string;
  level?: string;
  count?: number;
  target?: string;
}

export interface CardGenerationTriggerResponse {
  jobId: string;
}

export interface CardGenerationStatusResponse {
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress?: number;
  card?: Card;
  error?: string;
}