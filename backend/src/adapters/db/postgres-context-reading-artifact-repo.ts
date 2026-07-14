import { and, eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { contextReadingArtifacts } from '../../db/schema';
import { ContextReadingArtifact } from '../../domain/context-reading';
import {
    ContextReadingArtifactRepository,
    UpsertContextReadingArtifactInput,
    UpsertContextReadingArtifactResult,
} from '../../ports/context-reading-artifact-repository';

function toArtifact(row: typeof contextReadingArtifacts.$inferSelect): ContextReadingArtifact {
    const snapshot = Array.isArray(row.cardsSnapshot)
        ? row.cardsSnapshot.filter(
              (item): item is { question: string; answer: string } =>
                  !!item &&
                  typeof item === 'object' &&
                  typeof (item as { question?: unknown }).question === 'string' &&
                  typeof (item as { answer?: unknown }).answer === 'string'
          )
        : [];

    return new ContextReadingArtifact(
        row.id,
        row.userId,
        row.folderId,
        row.jobId,
        row.cardIds ?? [],
        snapshot,
        row.text,
        row.translation,
        row.level,
        row.hasAudio,
        row.createdAt
    );
}

export class PostgresContextReadingArtifactRepository
    implements ContextReadingArtifactRepository
{
    async findLatest(
        userId: string,
        folderId: string
    ): Promise<ContextReadingArtifact | null> {
        const row = await db.query.contextReadingArtifacts.findFirst({
            where: and(
                eq(contextReadingArtifacts.userId, userId),
                eq(contextReadingArtifacts.folderId, folderId)
            ),
        });
        return row ? toArtifact(row) : null;
    }

    async findByIdForUser(
        userId: string,
        artifactId: string
    ): Promise<ContextReadingArtifact | null> {
        const row = await db.query.contextReadingArtifacts.findFirst({
            where: and(
                eq(contextReadingArtifacts.id, artifactId),
                eq(contextReadingArtifacts.userId, userId)
            ),
        });
        return row ? toArtifact(row) : null;
    }

    async upsertLatest(
        input: UpsertContextReadingArtifactInput
    ): Promise<UpsertContextReadingArtifactResult> {
        const existing = await this.findLatest(input.userId, input.folderId);

        if (existing && existing.jobId === input.jobId) {
            return { artifact: existing, previousArtifactId: null };
        }

        if (existing) {
            await db
                .delete(contextReadingArtifacts)
                .where(eq(contextReadingArtifacts.id, existing.id));
        }

        const [row] = await db
            .insert(contextReadingArtifacts)
            .values({
                id: input.id,
                userId: input.userId,
                folderId: input.folderId,
                jobId: input.jobId,
                cardIds: input.cardIds,
                cardsSnapshot: input.cardsSnapshot,
                text: input.text,
                translation: input.translation,
                level: input.level,
                hasAudio: input.hasAudio,
                createdAt: input.createdAt,
            })
            .returning();

        return {
            artifact: toArtifact(row),
            previousArtifactId: existing && existing.jobId !== input.jobId ? existing.id : null,
        };
    }

    async deleteByUserId(userId: string, executor: any = db): Promise<void> {
        await executor
            .delete(contextReadingArtifacts)
            .where(eq(contextReadingArtifacts.userId, userId));
    }
}
