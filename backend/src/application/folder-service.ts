import { Folder } from '../domain/folder';
import { FolderRepository } from '../ports/folder-repository';

export class FolderService {
  constructor(private readonly folderRepo: FolderRepository) {}

  async createFolder(userId: string, name: string): Promise<Folder> {
    const id = crypto.randomUUID();
    const folder = new Folder(id, name, userId);
    await this.folderRepo.save(folder);
    return folder;
  }

  async renameFolder(id: string, newName: string): Promise<Folder | null> {
    const folder = await this.folderRepo.findById(id);
    if (!folder) return null;
    folder.name = newName;
    await this.folderRepo.save(folder);
    return folder;
  }

  async deleteFolder(id: string): Promise<boolean> {
    const folder = await this.folderRepo.findById(id);
    if (!folder) return false;
    await this.folderRepo.delete(id);
    return true;
  }

  async getAll(userId: string): Promise<Folder[]> {
    return this.folderRepo.findAll(userId);
  }
}
