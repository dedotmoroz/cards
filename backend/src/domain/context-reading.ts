export class ContextReadingState {
    constructor(
        public readonly userId: string,
        public readonly folderId: string,
        public usedCardIds: string[],
        public updatedAt: Date,
        /** Зафиксированный режим пула для сессии (меняется только после reset). */
        public onlyUnlearned: boolean
    ) {}
}

export type ContextReadingCardSnapshot = {
    question: string;
    answer: string;
};

export class ContextReadingArtifact {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly folderId: string,
        public readonly jobId: string,
        public readonly cardIds: string[],
        public readonly cardsSnapshot: ContextReadingCardSnapshot[],
        public readonly text: string,
        public readonly translation: string,
        public readonly level: string,
        public readonly hasAudio: boolean,
        public readonly createdAt: Date
    ) {}

    toPublicDTO() {
        return {
            id: this.id,
            folderId: this.folderId,
            jobId: this.jobId,
            cardIds: this.cardIds,
            cardsSnapshot: this.cardsSnapshot,
            text: this.text,
            translation: this.translation,
            level: this.level,
            hasAudio: this.hasAudio,
            createdAt: this.createdAt.toISOString(),
        };
    }
}

export const CONTEXT_READING_POOL_MODE_MISMATCH = 'CONTEXT_READING_POOL_MODE_MISMATCH';

export const MAX_CONTEXT_READING_ARTIFACTS = 10;