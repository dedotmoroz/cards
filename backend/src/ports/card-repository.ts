import { Card } from '../domain/card';

export interface CardRepository {
  save(card: Card): Promise<void>;
  findById(id: string): Promise<Card | null>;
  findAll(folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]>;
  delete(id: string): Promise<void>;
  deleteByFolderIds(folderIds: string[], executor?: any): Promise<void>;
  countByFolderIds(folderIds: string[]): Promise<Record<string, number>>;

  /**
   * Virtual подборки строятся на стороне backend.
   * На вход идут folderIds пользователя (получаем через FolderRepository).
   */
  /** Все карточки в папках пользователя, сортировка по coalesce(lastLearnedAt, createdAt) — без фильтра по выученности. */
  findRememberCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]>;
  findHardCardsByFolderIds(folderIds: string[], limit: number): Promise<Card[]>;
  /** Число карточек с теми же критериями, что и «Сложно» (выученные, reviewCount >= 2). */
  countHardCardsByFolderIds(folderIds: string[]): Promise<number>;
}
