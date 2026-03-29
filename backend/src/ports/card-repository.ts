import { Card } from '../domain/card';

export interface CardRepository {
  save(card: Card): Promise<void>;
  findById(id: string): Promise<Card | null>;
  findAll(folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]>;
  delete(id: string): Promise<void>;
  countByFolderIds(folderIds: string[]): Promise<Record<string, number>>;

  /**
   * Virtual подборки строятся на стороне backend.
   * На вход идут folderIds пользователя (получаем через FolderRepository).
   */
  findRememberCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]>;
  findHardCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]>;
}
