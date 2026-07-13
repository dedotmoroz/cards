import { Card } from '../../../domain/card';
import type { CardContext } from '../../../domain/card';

type CardRow = {
    id: string;
    folderId: string;
    question: string;
    answer: string;
    questionSentences: string | null;
    answerSentences: string | null;
    contexts?: CardContext[] | null;
    activeContextId?: string | null;
    isLearned: boolean;
    createdAt: Date;
    // Интервальное повторение
    lastShownAt: Date | null;
    lastLearnedAt: Date | null;
    nextReviewAt: Date | null;
    // Статистика
    reviewCount: number;
    correctCount: number;
    incorrectCount: number;
    // SM-2
    currentInterval: number;
    repetitions: number;
    easeFactor: number;
    lastRating: number | null;
    averageRating: number;
};

function normalizeContexts(raw: CardRow['contexts']): CardContext[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
        (item): item is CardContext =>
            !!item &&
            typeof item.id === 'string' &&
            typeof item.text === 'string' &&
            typeof item.translation === 'string' &&
            typeof item.createdAt === 'string',
    );
}

function hydrateLegacyContexts(row: CardRow): {
    contexts: CardContext[];
    activeContextId: string | null;
    questionSentences: string | null;
    answerSentences: string | null;
} {
    const contexts = normalizeContexts(row.contexts);
    if (contexts.length > 0) {
        return {
            contexts,
            activeContextId: row.activeContextId ?? contexts[contexts.length - 1].id,
            questionSentences: row.questionSentences,
            answerSentences: row.answerSentences,
        };
    }

    const text = row.questionSentences?.trim() ?? '';
    const translation = row.answerSentences?.trim() ?? '';
    if (!text && !translation) {
        return {
            contexts: [],
            activeContextId: null,
            questionSentences: null,
            answerSentences: null,
        };
    }

    // Stable id so repeated reads without SQL backfill stay consistent.
    const legacy: CardContext = {
        id: row.id,
        text,
        translation,
        createdAt: row.createdAt.toISOString(),
    };
    return {
        contexts: [legacy],
        activeContextId: row.id,
        questionSentences: text || null,
        answerSentences: translation || null,
    };
}

export function toCard(row: CardRow): Card {
    const hydrated = hydrateLegacyContexts(row);
    return new Card(
        row.id,
        row.folderId,
        row.question,
        row.answer,
        row.isLearned,
        row.createdAt,
        // Интервальное повторение
        row.lastShownAt,
        row.lastLearnedAt,
        row.nextReviewAt,
        // Статистика
        row.reviewCount,
        row.correctCount,
        row.incorrectCount,
        // SM-2
        row.currentInterval,
        row.repetitions,
        row.easeFactor,
        row.lastRating,
        row.averageRating,
        hydrated.questionSentences,
        hydrated.answerSentences,
        hydrated.contexts,
        hydrated.activeContextId,
    );
}
