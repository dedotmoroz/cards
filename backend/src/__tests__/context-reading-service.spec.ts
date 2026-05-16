import { Card } from '../domain/card'
import { ContextReadingState, CONTEXT_READING_POOL_MODE_MISMATCH } from '../domain/context-reading'
import { GetNextContextCardsUseCase, ResetContextReadingUseCase } from '../application/context-reading-service'

export class InMemoryCardRepository {
    constructor(private cards: Card[]) {}

    async findByFolderForContext(
        _userId: string,
        folderId: string,
        onlyUnlearned: boolean
    ): Promise<Card[]> {
        return this.cards.filter(
            c => c.folderId === folderId && (!onlyUnlearned || !c.isLearned)
        )
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
            limit: 3,
            onlyUnlearned: true,
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
            limit: 3,
            onlyUnlearned: true,
        })

        const second = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3,
            onlyUnlearned: true,
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
            limit: 5,
            onlyUnlearned: true,
        })

        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3,
            onlyUnlearned: true,
        })

        expect(result.cards).toHaveLength(0)
        expect(result.completed).toBe(true)
    })

    it('correctly updates progress', async () => {
        await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 2,
            onlyUnlearned: true,
        })

        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 2,
            onlyUnlearned: true,
        })

        expect(result.progress.used).toBe(4)
        expect(result.progress.total).toBe(5)
    })

    it('defaults onlyUnlearned to true when omitted', async () => {
        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3,
        })
        expect(result.progress.total).toBe(5)
        expect(stateRepo.getState()?.onlyUnlearned).toBe(true)
    })

    it('when onlyUnlearned is false, pool includes learned cards', async () => {
        const learned = new Card('card-L', 'folder-1', 'learned-q', 'learned-a', true)
        cardRepo = new InMemoryCardRepository([...makeCards(5), learned])
        useCase = new GetNextContextCardsUseCase(cardRepo as any, stateRepo as any)

        const result = await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 3,
            onlyUnlearned: false,
        })

        expect(result.progress.total).toBe(6)
        expect(result.cards.length).toBe(3)
        expect(stateRepo.getState()?.onlyUnlearned).toBe(false)
    })

    it('throws when pool mode differs from saved session', async () => {
        await useCase.execute({
            userId: 'user-1',
            folderId: 'folder-1',
            limit: 1,
            onlyUnlearned: true,
        })

        await expect(
            useCase.execute({
                userId: 'user-1',
                folderId: 'folder-1',
                limit: 1,
                onlyUnlearned: false,
            })
        ).rejects.toThrow(CONTEXT_READING_POOL_MODE_MISMATCH)
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
                new Date(),
                true
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
