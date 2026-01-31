import { Card } from '../domain/card';
import { ContextReadingState } from '../domain/context-reading';

export interface CardRepository {
    findUnlearnedByFolder(
        userId: string,
        folderId: string
    ): Promise<Card[]>
}

export interface ContextReadingStateRepository {
    findByUserAndFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingState | null>;
    save(state: ContextReadingState): Promise<void>;
    reset(userId: string, folderId: string): Promise<void>;
}

/**
 * Это простая реализация интерфейса CardRepository и ContextReadingStateRepository,
 * которая хранит прогресс контекстного чтения в памяти процесса.
 */

export class InMemoryCardRepository implements CardRepository {
    constructor(private readonly cards: Card[]) {}

    async findUnlearnedByFolder(
        userId: string,
        folderId: string
    ): Promise<Card[]> {
        // return this.cards.filter(
        //     c => c.folderId === folderId && !c.isLearned
        // )
        /**
         * Отключаем пока фильтр
         */
        return this.cards
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
}