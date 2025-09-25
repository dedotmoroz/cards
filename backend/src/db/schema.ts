import { pgTable, uuid, text, vector, boolean, timestamp } from 'drizzle-orm/pg-core';

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

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  oauth_provider: text('oauth_provider'),
  oauth_id: text('oauth_id'),
});