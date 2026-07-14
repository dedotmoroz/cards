import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '../../db/db';
import { contextReadingArtifacts } from '../../db/schema';
import { ContextReadingArtifact } from '../../domain/context-reading';
import {
    AppendContextReadingArtifactInput,
    AppendContextReadingArtifactResult,
    ContextReadingArtifactRepository,
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
    async listByFolder(
        userId: string,
        folderId: string
    ): Promise<ContextReadingArtifact[]> {
        const rows = await db
            .select()
            .from(contextReadingArtifacts)
            .where(
                and(
                    eq(contextReadingArtifacts.userId, userId),
                    eq(contextReadingArtifacts.folderId, folderId)
                )
            )
            .orderBy(asc(contextReadingArtifacts.createdAt));

        return rows.map(toArtifact);
    }

    async findByJobId(
        userId: string,
        folderId: string,
        jobId: string
    ): Promise<ContextReadingArtifact | null> {
        const row = await db.query.contextReadingArtifacts.findFirst({
            where: and(
                eq(contextReadingArtifacts.userId, userId),
                eq(contextReadingArtifacts.folderId, folderId),
                eq(contextReadingArtifacts.jobId, jobId)
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

    async insertAppend(
        input: AppendContextReadingArtifactInput
    ): Promise<AppendContextReadingArtifactResult> {
        const existing = await this.findByJobId(
            input.userId,
            input.folderId,
            input.jobId
        );
        if (existing) {
            return { artifact: existing, alreadyExisted: true };
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

        return { artifact: toArtifact(row), alreadyExisted: false };
    }

    async pruneOldestBeyond(
        userId: string,
        folderId: string,
        limit: number
    ): Promise<string[]> {
        const all = await this.listByFolder(userId, folderId);
        if (all.length <= limit) {
            return [];
        }

        const toDelete = all.slice(0, all.length - limit);
        const ids = toDelete.map(a => a.id);

        await db
            .delete(contextReadingArtifacts)
            .where(inArray(contextReadingArtifacts.id, ids));

        return ids;
    }

    async deleteByUserId(userId: string, executor: any = db): Promise<void> {
        await executor
            .delete(contextReadingArtifacts)
            .where(eq(contextReadingArtifacts.userId, userId));
    }
}
