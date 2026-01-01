import { ContextReadingState } from '../domain/context-reading'
import { CardRepository, ContextReadingStateRepository } from '../ports/context-reading-repository'
import { Card } from '../domain/card'

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

export class GetNextContextCardsUseCase {
    constructor(
        private readonly cardRepo: CardRepository,
        private readonly stateRepo: ContextReadingStateRepository
    ) {}

    async execute(params: {
        userId: string
        folderId: string
        limit: number
    }): Promise<{
        cards: Card[]
        progress: { used: number; total: number }
        completed: boolean
    }> {
        const { userId, folderId, limit } = params

        const allCards =
            await this.cardRepo.findUnlearnedByFolder(userId, folderId)

        let state =
            await this.stateRepo.findByUserAndFolder(userId, folderId)

        if (!state) {
            state = new ContextReadingState(
                userId,
                folderId,
                [],
                new Date()
            )
        }

        const used = new Set(state.usedCardIds)

        const unusedCards = allCards.filter(
            c => !used.has(c.id)
        )

        if (unusedCards.length === 0) {
            return {
                cards: [],
                progress: {
                    used: state.usedCardIds.length,
                    total: allCards.length
                },
                completed: true
            }
        }

        const selected = shuffle(unusedCards).slice(0, limit)

        state.usedCardIds.push(...selected.map(c => c.id))
        state.updatedAt = new Date()

        await this.stateRepo.save(state)

        return {
            cards: selected,
            progress: {
                used: state.usedCardIds.length,
                total: allCards.length
            },
            completed: false
        }
    }
}

export class ResetContextReadingUseCase {
    constructor(
        private readonly stateRepo: ContextReadingStateRepository
    ) {}

    async execute(params: {
        userId: string;
        folderId: string;
    }): Promise<void> {
        const { userId, folderId } = params;

        await this.stateRepo.reset(userId, folderId);
    }
}