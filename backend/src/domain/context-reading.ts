export class ContextReadingState {
    constructor(
        public readonly userId: string,
        public readonly folderId: string,
        public usedCardIds: string[],
        public updatedAt: Date
    ) {}
}