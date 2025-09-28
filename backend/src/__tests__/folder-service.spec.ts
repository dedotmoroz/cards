import { FolderService } from '../application/folder-service';
import { Folder } from '../domain/folder';
import { FolderRepository } from '../ports/folder-repository';

const createMockRepo = (): jest.Mocked<FolderRepository> => ({
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    delete: jest.fn(),
});

describe('FolderService', () => {
    let repo: jest.Mocked<FolderRepository>;
    let service: FolderService;

    beforeEach(() => {
        repo = createMockRepo();
        service = new FolderService(repo);
    });

    it('создает новую папку', async () => {
        const folder = await service.createFolder('user1', 'My Folder');

        expect(folder.name).toBe('My Folder');
        expect(folder.userId).toBe('user1');
        expect(repo.save).toHaveBeenCalledWith(folder);
    });

    it('переименовывает папку', async () => {
        const folder = new Folder('123', 'Old Name', 'user1');
        repo.findById.mockResolvedValue(folder);

        const updated = await service.renameFolder('123', 'New Name');

        expect(updated?.name).toBe('New Name');
        expect(repo.save).toHaveBeenCalledWith(folder);
    });

    it('удаляет папку', async () => {
        const mockFolder = new Folder('123', 'Test Folder', 'user1');
        repo.findById.mockResolvedValue(mockFolder);
        await service.deleteFolder('123');
        expect(repo.delete).toHaveBeenCalledWith('123');
    });

    it('возвращает все папки пользователя', async () => {
        const folders = [
            new Folder('1', 'Set 1', 'user1'),
            new Folder('2', 'Set 2', 'user1'),
        ];
        repo.findAll.mockResolvedValue(folders);

        const result = await service.getAll('user1');
        expect(result).toEqual(folders);
    });
});