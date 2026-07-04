import { Folder } from '../domain/folder';
import { FolderRepository } from '../ports/folder-repository';

export interface UpdateFolderParams {
  name?: string;
  sideALanguage?: string;
  sideBLanguage?: string;
  pinned?: boolean;
}

export class FolderService {
  constructor(private readonly folderRepo: FolderRepository) {}

  async createFolder(
    userId: string,
    name: string,
    sideALanguage: string,
    sideBLanguage: string,
  ): Promise<Folder> {
    const id = crypto.randomUUID();
    const folder = new Folder(id, name, userId, sideALanguage, sideBLanguage, new Date(), false);
    await this.folderRepo.save(folder);
    return folder;
  }

  async updateFolder(id: string, updates: UpdateFolderParams): Promise<Folder | null> {
    const folder = await this.folderRepo.findById(id);
    if (!folder) return null;
    if (updates.name !== undefined) {
      folder.name = updates.name;
    }
    if (updates.sideALanguage !== undefined) {
      folder.sideALanguage = updates.sideALanguage;
    }
    if (updates.sideBLanguage !== undefined) {
      folder.sideBLanguage = updates.sideBLanguage;
    }
    if (updates.pinned !== undefined) {
      folder.pinned = updates.pinned;
    }
    await this.folderRepo.save(folder);
    return folder;
  }

  /** @deprecated Use updateFolder */
  async renameFolder(id: string, newName: string): Promise<Folder | null> {
    return this.updateFolder(id, { name: newName });
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
