import { FolderRepository } from '../../ports/folder-repository';
import { Folder } from '../../domain/folder';

export class InMemoryFolderRepository implements FolderRepository {
    private folders: Folder[] = [];

    async save(folder: Folder): Promise<void> {
        const index = this.folders.findIndex(f => f.id === folder.id);
        if (index >= 0) this.folders[index] = folder;
        else this.folders.push(folder);
    }

    async findById(id: string): Promise<Folder | null> {
        const folder = this.folders.find(folder => folder.id === id);
        return folder ?? null; // возвращаем null вместо undefined
    }

    async findAll(userId: string): Promise<Folder[]> {
        return this.folders.filter(folder => folder.userId === userId);
    }

    async delete(id: string): Promise<void> {
        this.folders = this.folders.filter(folder => folder.id !== id);
    }
}