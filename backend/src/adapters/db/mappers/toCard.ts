import { Card } from '../../../domain/card';

type CardRow = {
    id: string;
    folderId: string;
    question: string;
    answer: string;
    isLearned: boolean;
};

export function toCard(row: CardRow): Card {
    return new Card(
        row.id,
        row.folderId,
        row.question,
        row.answer,
        row.isLearned,
    );
}