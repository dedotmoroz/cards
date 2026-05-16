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

export const CONTEXT_READING_POOL_MODE_MISMATCH = 'CONTEXT_READING_POOL_MODE_MISMATCH';