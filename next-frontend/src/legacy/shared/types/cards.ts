export interface Folder {
  id: string;
  name: string;
  userId: string;
  sideALanguage: string;
  sideBLanguage: string;
  cardCount?: number;
  createdAt?: string;
  pinned?: boolean;
}

export interface CardContext {
  id: string;
  text: string;
  translation: string;
  createdAt: string;
}

export const MAX_CARD_CONTEXTS = 5;

export interface Card {
  id: string;
  question: string;
  answer: string;
  questionSentences?: string;
  answerSentences?: string;
  contexts?: CardContext[];
  activeContextId?: string | null;
  isLearned: boolean;
  folderId: string;
}

export interface CardSearchResult extends Card {
  folderName?: string;
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
  activeContextId?: string | null;
}

export interface UpdateCardLearnStatusData {
  isLearned: boolean;
}

export type ReviewOutcome = 'know' | 'dontknow';

export interface ReviewCardData {
  outcome: ReviewOutcome;
}

export interface CardGenerationRequest {
  lang?: string;
  level?: string;
  count?: number;
  target?: string;
  replaceOldest?: boolean;
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

/** Prefer structured contexts; fall back to legacy sentence mirrors. */
export function getCardContexts(card: Card): CardContext[] {
  if (card.contexts && card.contexts.length > 0) {
    return card.contexts;
  }
  if (card.questionSentences || card.answerSentences) {
    return [
      {
        id: card.activeContextId || card.id,
        text: card.questionSentences ?? '',
        translation: card.answerSentences ?? '',
        createdAt: '',
      },
    ];
  }
  return [];
}

export function getActiveCardContext(card: Card): CardContext | null {
  const contexts = getCardContexts(card);
  if (contexts.length === 0) return null;
  if (card.activeContextId) {
    const found = contexts.find((c) => c.id === card.activeContextId);
    if (found) return found;
  }
  return contexts[contexts.length - 1] ?? null;
}
