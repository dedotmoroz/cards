import { randomUUID } from 'crypto';
import { ContextReadingState, ContextReadingArtifact, CONTEXT_READING_POOL_MODE_MISMATCH } from '../domain/context-reading'
import { CardRepository as ContextReadingCardRepository, ContextReadingStateRepository } from '../ports/context-reading-repository'
import { ContextReadingArtifactRepository } from '../ports/context-reading-artifact-repository'
import { CardRepository } from '../ports/card-repository'
import { FolderRepository } from '../ports/folder-repository'
import { Card } from '../domain/card'
import type {
    ContextRequestPayload,
    ContextJobResponse,
    ContextJobStatusResponse,
} from '../adapters/ai/ai-service-client'

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
        /** Если не передан — считается `true` (обратная совместимость). */
        onlyUnlearned?: boolean
    }): Promise<{
        cards: Card[]
        progress: { used: number; total: number }
        completed: boolean
    }> {
        const { userId, folderId, limit } = params
        const onlyUnlearned = params.onlyUnlearned ?? true

        let state =
            await this.stateRepo.findByUserAndFolder(userId, folderId)

        if (state && state.onlyUnlearned !== onlyUnlearned) {
            throw new Error(CONTEXT_READING_POOL_MODE_MISMATCH)
        }

        const allCards =
            await this.cardRepo.findByFolderForContext(userId, folderId, onlyUnlearned)

        if (!state) {
            state = new ContextReadingState(
                userId,
                folderId,
                [],
                new Date(),
                onlyUnlearned
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
        private readonly folderRepo: FolderRepository,
        private readonly requestContextGeneration: (payload: ContextRequestPayload) => Promise<ContextJobResponse>
    ) {}

    async execute(params: {
        userId: string;
        cardIds: string[];
        lang?: string;
        level?: string;
    }): Promise<{ jobId: string }> {
        const { userId, cardIds, lang, level } = params;

        const cards = await Promise.all(
            cardIds.map(id => this.cardRepo.findById(id))
        );

        const missingCards = cards.filter(card => card === null);
        if (missingCards.length > 0) {
            throw new Error('Some cards not found');
        }

        const resolvedCards = cards as NonNullable<typeof cards[0]>[];
        const folderIds = new Set(resolvedCards.map(card => card.folderId));
        if (folderIds.size !== 1) {
            throw new Error('Cards must belong to the same folder');
        }

        const folderId = resolvedCards[0].folderId;
        const folder = await this.folderRepo.findById(folderId);
        if (!folder) {
            throw new Error('Folder not found');
        }
        if (folder.userId !== userId) {
            throw new Error('Access denied');
        }

        const words = resolvedCards.map(card => ({
            word: card.question,
            translation: card.answer,
        }));

        const { jobId } = await this.requestContextGeneration({
            words,
            lang: lang ?? folder.sideALanguage,
            level: level ?? 'B1',
            translationLang: folder.sideBLanguage,
            userId,
            traceId: randomUUID(),
        });

        return { jobId };
    }
}

export class GetLatestContextReadingArtifactUseCase {
    constructor(
        private readonly artifactRepo: ContextReadingArtifactRepository,
        private readonly folderRepo: FolderRepository
    ) {}

    async execute(params: {
        userId: string;
        folderId: string;
    }): Promise<ContextReadingArtifact | null> {
        const folder = await this.folderRepo.findById(params.folderId);
        if (!folder) {
            throw new Error('Folder not found');
        }
        if (folder.userId !== params.userId) {
            throw new Error('Access denied');
        }

        return this.artifactRepo.findLatest(params.userId, params.folderId);
    }
}

export class PersistContextReadingArtifactUseCase {
    constructor(
        private readonly artifactRepo: ContextReadingArtifactRepository,
        private readonly cardRepo: CardRepository,
        private readonly folderRepo: FolderRepository,
        private readonly fetchContextGenerationStatus: (jobId: string) => Promise<ContextJobStatusResponse>,
        private readonly promoteContextAudio: (
            jobId: string,
            artifactId: string
        ) => Promise<{ ok: boolean; hasAudio: boolean }>,
        private readonly deleteContextArtifactAudio: (
            artifactId: string
        ) => Promise<{ ok: boolean; deleted: boolean }>
    ) {}

    async execute(params: {
        userId: string;
        jobId: string;
        folderId: string;
        cardIds: string[];
        level?: string;
    }): Promise<ContextReadingArtifact> {
        const { userId, jobId, folderId, cardIds } = params;
        const level = params.level ?? 'B1';

        const folder = await this.folderRepo.findById(folderId);
        if (!folder) {
            throw new Error('Folder not found');
        }
        if (folder.userId !== userId) {
            throw new Error('Access denied');
        }

        const existing = await this.artifactRepo.findLatest(userId, folderId);
        if (existing && existing.jobId === jobId) {
            return existing;
        }

        const status = await this.fetchContextGenerationStatus(jobId);
        if (status.queueType && status.queueType !== 'context') {
            throw new Error('Invalid job type');
        }
        if (status.state !== 'completed' || !status.result) {
            throw new Error('Job not completed');
        }

        const cards = await Promise.all(cardIds.map(id => this.cardRepo.findById(id)));
        const missing = cards.some(card => card === null);
        if (missing) {
            throw new Error('Some cards not found');
        }
        const resolvedCards = cards as NonNullable<(typeof cards)[0]>[];
        if (resolvedCards.some(card => card.folderId !== folderId)) {
            throw new Error('Cards must belong to the same folder');
        }

        const artifactId = randomUUID();
        let hasAudio = Boolean(status.result.hasAudio);

        if (hasAudio) {
            try {
                const promoted = await this.promoteContextAudio(jobId, artifactId);
                hasAudio = promoted.hasAudio;
            } catch {
                hasAudio = false;
            }
        }

        const { artifact, previousArtifactId } = await this.artifactRepo.upsertLatest({
            id: artifactId,
            userId,
            folderId,
            jobId,
            cardIds,
            cardsSnapshot: resolvedCards.map(card => ({
                question: card.question,
                answer: card.answer,
            })),
            text: status.result.text,
            translation: status.result.translation,
            level,
            hasAudio,
            createdAt: new Date(),
        });

        if (previousArtifactId) {
            try {
                await this.deleteContextArtifactAudio(previousArtifactId);
            } catch (error) {
                console.error(
                    `[context-reading] failed to delete previous artifact audio ${previousArtifactId}`,
                    error
                );
            }
        }

        return artifact;
    }
}
