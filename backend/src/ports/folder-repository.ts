import { Folder } from '../domain/folder';

export interface FolderRepository {
  save(folder: Folder): Promise<void>;
  findById(id: string): Promise<Folder | null>;
  findAll(userId: string): Promise<Folder[]>;
  delete(id: string): Promise<void>;
}
