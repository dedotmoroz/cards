import { Card } from '../domain/card'
import { ContextReadingState } from '../domain/context-reading'
import { GetNextContextCardsUseCase, ResetContextReadingUseCase } from '../application/context-reading-service'

export class InMemoryCardRepository {
    constructor(private cards: Card[]) {}

    async findUnlearnedByFolder(): Promise<Card[]> {
        return this.cards.filter(c => !c.isLearned)
    }
}

export class InMemoryContextReadingStateRepository {
    private state: ContextReadingState | null = null

    async findByUserAndFolder(): Promise<ContextReadingState | null> {
        return this.state
    }

    async save(state: ContextReadingState): Promise<void> {
        this.state = state
    }

    async reset(): Promise<void> {
        this.state = null
    }

    // helper for tests
    getState() {
        return this.state
    }
}

function makeCards(count: number): Card[] {
    return Array.from({ length: count }).map((_, i) =>
        new Card(
            `card-${i + 1}`,
            'folder-1',
            `front-${i + 1}`,
            `back-${i + 1}`,
            false
        )
    )
}

describe('GetNextContextCardsUseCase', () => {
    let cardRepo: InMemoryCardRepository
    let stateRepo: InMemoryContextReadingStateRepository
    let useCase: GetNextContextCardsUseCase

    beforeEach(() => {
        cardRepo = new InMemoryCardRepository(makeCards(5))
        stateRepo = new InMemoryContextReadingStateRepository()

        useCase = new GetNextContextCardsUseCase(
            cardRepo as any,
            stateRepo as any
        )
    })

    it('returns first portion of cards when state does not exist', async () => {
        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3
        })

        expect(result.cards).toHaveLength(3)
        expect(result.completed).toBe(false)
        expect(result.progress.used).toBe(3)
        expect(result.progress.total).toBe(5)
    })

    it('does not repeat cards on next call', async () => {
        const first = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3
        })

        const second = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3
        })

        const firstIds = first.cards.map(c => c.id)
        const secondIds = second.cards.map(c => c.id)

        firstIds.forEach(id => {
            expect(secondIds).not.toContain(id)
        })
    })

    it('returns completed=true when no unused cards left', async () => {
        await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 5
        })

        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3
        })

        expect(result.cards).toHaveLength(0)
        expect(result.completed).toBe(true)
    })

    it('correctly updates progress', async () => {
        await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 2
        })

        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 2
        })

        expect(result.progress.used).toBe(4)
        expect(result.progress.total).toBe(5)
    })
})

describe('ResetContextReadingUseCase', () => {
    it('resets context reading state', async () => {
        const repo = new InMemoryContextReadingStateRepository()

        await repo.save(
            new ContextReadingState(
                'user-1',
                'folder-1',
                ['card-1', 'card-2'],
                new Date()
            )
        )

        const useCase = new ResetContextReadingUseCase(repo as any)

        await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1'
        })

        expect(repo.getState()).toBeNull()
    })
})