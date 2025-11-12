import { Card } from '../../../domain/card';

type CardRow = {
    id: string;
    folderId: string;
    question: string;
    answer: string;
    questionSentences: string | null;
    answerSentences: string | null;
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

export function toCard(row: CardRow): Card {
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
        row.questionSentences,
        row.answerSentences
    );
}