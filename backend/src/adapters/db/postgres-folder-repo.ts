import { eq } from 'drizzle-orm';
import { db } from '../../db/db';
import { Folder } from '../../domain/folder';
import { FolderRepository } from '../../ports/folder-repository';
import { folders } from '../../db/schema';

export class PostgresFolderRepository implements FolderRepository {
    async save(folder: Folder): Promise<void> {
        const existing = await db.query.folders.findFirst({
            where: eq(folders.id, folder.id),
        });

        if (existing) {
            await db.update(folders).set({
                name: folder.name,
                userId: folder.userId,
            }).where(eq(folders.id, folder.id));
        } else {
            await db.insert(folders).values({
                id: folder.id,
                name: folder.name,
                userId: folder.userId,
            });
        }
    }

    async findById(id: string): Promise<Folder | null> {
        const row = await db.query.folders.findFirst({
            where: eq(folders.id, id),
        });

        return row ? new Folder(row.id, row.name, row.userId) : null;
    }

    async findAll(userId: string): Promise<Folder[]> {
        const results = await db.select().from(folders).where(eq(folders.userId, userId));
        return results.map(row => new Folder(row.id, row.name, row.userId));
    }

    async delete(id: string): Promise<void> {
        await db.delete(folders).where(eq(folders.id, id));
    }
}