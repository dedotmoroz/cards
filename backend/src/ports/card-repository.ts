import { Card } from '../domain/card';

export interface CardRepository {
  save(card: Card): Promise<void>;
  findById(id: string): Promise<Card | null>;
  findAll(folderId?: string, filter?: { isLearned?: boolean }): Promise<Card[]>;
  delete(id: string): Promise<void>;
}
