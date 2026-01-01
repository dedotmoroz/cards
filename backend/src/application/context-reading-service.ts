import { randomUUID } from 'crypto';
import { ContextReadingState } from '../domain/context-reading'
import { CardRepository as ContextReadingCardRepository, ContextReadingStateRepository } from '../ports/context-reading-repository'
import { CardRepository } from '../ports/card-repository'
import { UserRepository } from '../ports/user-repository'
import { Card } from '../domain/card'
import type { ContextRequestPayload, ContextJobResponse } from '../adapters/ai/ai-service-client'

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
}

export class GetNextContextCardsUseCase {
    constructor(
        private readonly cardRepo: ContextReadingCardRepository,
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

export class GenerateContextTextUseCase {
    constructor(
        private readonly cardRepo: CardRepository,
        private readonly userRepo: UserRepository,
        private readonly requestContextGeneration: (payload: ContextRequestPayload) => Promise<ContextJobResponse>
    ) {}

    async execute(params: {
        userId: string;
        cardIds: string[];
        lang: string;
        level?: string;
    }): Promise<{ jobId: string }> {
        const { userId, cardIds, lang, level } = params;

        // Загружаем карточки
        const cards = await Promise.all(
            cardIds.map(id => this.cardRepo.findById(id))
        );

        // Проверяем, что все карточки найдены
        const missingCards = cards.filter(card => card === null);
        if (missingCards.length > 0) {
            throw new Error('Some cards not found');
        }

        // Формируем payload для AI-сервиса
        const words = (cards as NonNullable<typeof cards[0]>[]).map(card => ({
            word: card.question,
            translation: card.answer,
        }));

        // Получаем язык пользователя для перевода
        const user = await this.userRepo.findById(userId);
        const translationLang = user?.language ?? 'en';

        // Вызываем AI-сервис
        const { jobId } = await this.requestContextGeneration({
            words,
            lang,
            level: level ?? 'B1',
            translationLang,
            userId,
            traceId: randomUUID(),
        });

        return { jobId };
    }
}