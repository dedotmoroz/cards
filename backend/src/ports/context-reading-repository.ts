import { Card } from '../domain/card';
import { ContextReadingState } from '../domain/context-reading';

export interface CardRepository {
    findByFolderForContext(
        userId: string,
        folderId: string,
        onlyUnlearned: boolean
    ): Promise<Card[]>
}

export interface ContextReadingStateRepository {
    findByUserAndFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingState | null>;
    save(state: ContextReadingState): Promise<void>;
    reset(userId: string, folderId: string): Promise<void>;
    deleteByUserId(userId: string, executor?: any): Promise<void>;
}

/**
 * Это простая реализация интерфейса CardRepository и ContextReadingStateRepository,
 * которая хранит прогресс контекстного чтения в памяти процесса.
 */

export class InMemoryCardRepository implements CardRepository {
    constructor(private readonly cards: Card[]) {}

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

export class InMemoryContextReadingStateRepository
    implements ContextReadingStateRepository {

    private states = new Map<string, ContextReadingState>()

    private key(userId: string, folderId: string) {
        return `${userId}:${folderId}`
    }

    async findByUserAndFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingState | null> {
        return this.states.get(this.key(userId, folderId)) ?? null
    }

    async save(state: ContextReadingState): Promise<void> {
        this.states.set(
            this.key(state.userId, state.folderId),
            state
        )
    }

    async reset(userId: string, folderId: string): Promise<void> {
        this.states.delete(this.key(userId, folderId))
    }

    async deleteByUserId(userId: string): Promise<void> {
        for (const key of this.states.keys()) {
            if (key.startsWith(`${userId}:`)) {
                this.states.delete(key)
            }
        }
    }
}