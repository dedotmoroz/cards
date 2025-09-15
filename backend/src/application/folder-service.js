import { Folder } from '../domain/folder.js';
export class FolderService {
    folderRepo;
    constructor(folderRepo) {
        this.folderRepo = folderRepo;
    }
    async createFolder(userId, name) {
        const id = crypto.randomUUID();
        const folder = new Folder(id, name, userId);
        await this.folderRepo.save(folder);
        return folder;
    }
    async renameFolder(id, newName) {
        const folder = await this.folderRepo.findById(id);
        if (!folder)
            return null;
        folder.name = newName;
        await this.folderRepo.save(folder);
        return folder;
    }
    async deleteFolder(id) {
        await this.folderRepo.delete(id);
    }
    async getAll(userId) {
        return this.folderRepo.findAll(userId);
    }
}
