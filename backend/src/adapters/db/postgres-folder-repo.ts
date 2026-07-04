import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { Folder } from '../../domain/folder';
import { FolderRepository } from '../../ports/folder-repository';
import { folders } from '../../db/schema';

function rowToFolder(row: {
    id: string;
    name: string;
    userId: string;
    sideALanguage: string;
    sideBLanguage: string;
    createdAt: Date;
    pinned: boolean;
}): Folder {
    return new Folder(
        row.id,
        row.name,
        row.userId,
        row.sideALanguage,
        row.sideBLanguage,
        row.createdAt,
        row.pinned,
    );
}

export class PostgresFolderRepository implements FolderRepository {
    async save(folder: Folder): Promise<void> {
        const existing = await db.query.folders.findFirst({
            where: eq(folders.id, folder.id),
        });

        if (existing) {
            await db.update(folders).set({
                name: folder.name,
                userId: folder.userId,
                sideALanguage: folder.sideALanguage,
                sideBLanguage: folder.sideBLanguage,
                pinned: folder.pinned,
            }).where(eq(folders.id, folder.id));
        } else {
            await db.insert(folders).values({
                id: folder.id,
                name: folder.name,
                userId: folder.userId,
                sideALanguage: folder.sideALanguage,
                sideBLanguage: folder.sideBLanguage,
                createdAt: folder.createdAt,
                pinned: folder.pinned,
            });
        }
    }

    async findById(id: string): Promise<Folder | null> {
        const row = await db.query.folders.findFirst({
            where: eq(folders.id, id),
        });

        return row ? rowToFolder(row) : null;
    }

    async findAll(userId: string): Promise<Folder[]> {
        const results = await db.select().from(folders).where(eq(folders.userId, userId));
        return results.map(rowToFolder);
    }

    async delete(id: string): Promise<void> {
        await db.delete(folders).where(eq(folders.id, id));
    }

    async deleteByUserId(userId: string, executor: any = db): Promise<void> {
        await executor.delete(folders).where(eq(folders.userId, userId));
    }
}
