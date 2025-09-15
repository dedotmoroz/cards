import { pgTable, uuid, text, vector, boolean } from 'drizzle-orm/pg-core';

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  folderId: uuid('folder_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  isLearned: boolean('is_learned').notNull().default(false),
  embedding: vector('embedding', { dimensions: 1536 }), // для AI
});

export const folders = pgTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  userId: text('user_id').notNull(),
});