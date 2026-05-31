import { Card } from '../domain/card'
import { Folder } from '../domain/folder'
import { ContextReadingState, CONTEXT_READING_POOL_MODE_MISMATCH } from '../domain/context-reading'
import { GetNextContextCardsUseCase, ResetContextReadingUseCase, GenerateContextTextUseCase } from '../application/context-reading-service'
import { TEST_FOLDER_LANGUAGES } from './test-folder-defaults'

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

class InMemoryGenerateCardRepository {
    constructor(private cards: Map<string, Card>) {}

    async findById(id: string): Promise<Card | null> {
        return this.cards.get(id) ?? null
    }
}

class InMemoryGenerateFolderRepository {
    constructor(private folders: Map<string, Folder>) {}

    async findById(id: string): Promise<Folder | null> {
        return this.folders.get(id) ?? null
    }
}

describe('GenerateContextTextUseCase', () => {
    const userId = 'user-1'
    const folderId = 'folder-1'
    const folder = new Folder(
        folderId,
        'Test Folder',
        userId,
        TEST_FOLDER_LANGUAGES.sideALanguage,
        TEST_FOLDER_LANGUAGES.sideBLanguage,
    )
    const cards = [
        new Card('card-1', folderId, 'hello', 'привет', false),
        new Card('card-2', folderId, 'world', 'мир', false),
        new Card('card-3', folderId, 'test', 'тест', false),
    ]

    it('passes folder side languages to ai-service', async () => {
        const requestContextGeneration = jest.fn().mockResolvedValue({ jobId: 'job-1' })
        const useCase = new GenerateContextTextUseCase(
            new InMemoryGenerateCardRepository(new Map(cards.map(c => [c.id, c]))) as any,
            new InMemoryGenerateFolderRepository(new Map([[folderId, folder]])) as any,
            requestContextGeneration,
        )

        const result = await useCase.execute({
            userId,
            cardIds: cards.map(c => c.id),
            level: 'B1',
        })

        expect(result).toEqual({ jobId: 'job-1' })
        expect(requestContextGeneration).toHaveBeenCalledWith(
            expect.objectContaining({
                lang: 'en',
                translationLang: 'ru',
                level: 'B1',
                words: [
                    { word: 'hello', translation: 'привет' },
                    { word: 'world', translation: 'мир' },
                    { word: 'test', translation: 'тест' },
                ],
            }),
        )
    })

    it('allows body.lang override while translationLang stays from folder', async () => {
        const requestContextGeneration = jest.fn().mockResolvedValue({ jobId: 'job-1' })
        const useCase = new GenerateContextTextUseCase(
            new InMemoryGenerateCardRepository(new Map(cards.map(c => [c.id, c]))) as any,
            new InMemoryGenerateFolderRepository(new Map([[folderId, folder]])) as any,
            requestContextGeneration,
        )

        await useCase.execute({
            userId,
            cardIds: cards.map(c => c.id),
            lang: 'de',
        })

        expect(requestContextGeneration).toHaveBeenCalledWith(
            expect.objectContaining({
                lang: 'de',
                translationLang: 'ru',
            }),
        )
    })

    it('throws when cards belong to different folders', async () => {
        const mixedCards = [
            ...cards,
            new Card('card-4', 'folder-2', 'other', 'другое', false),
        ]
        const useCase = new GenerateContextTextUseCase(
            new InMemoryGenerateCardRepository(new Map(mixedCards.map(c => [c.id, c]))) as any,
            new InMemoryGenerateFolderRepository(new Map([[folderId, folder]])) as any,
            jest.fn(),
        )

        await expect(
            useCase.execute({
                userId,
                cardIds: mixedCards.map(c => c.id),
            }),
        ).rejects.toThrow('Cards must belong to the same folder')
    })

    it('throws when folder access is denied', async () => {
        const requestContextGeneration = jest.fn()
        const useCase = new GenerateContextTextUseCase(
            new InMemoryGenerateCardRepository(new Map(cards.map(c => [c.id, c]))) as any,
            new InMemoryGenerateFolderRepository(new Map([[folderId, folder]])) as any,
            requestContextGeneration,
        )

        await expect(
            useCase.execute({
                userId: 'other-user',
                cardIds: cards.map(c => c.id),
            }),
        ).rejects.toThrow('Access denied')

        expect(requestContextGeneration).not.toHaveBeenCalled()
    })
})
