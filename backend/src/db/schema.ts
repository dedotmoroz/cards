import { pgTable, uuid, text, vector, boolean, timestamp, integer, real, primaryKey, bigint } from 'drizzle-orm/pg-core';

export const cards = pgTable('cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  folderId: uuid('folder_id').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  questionSentences: text('question_sentences'),
  answerSentences: text('answer_sentences'),
  isLearned: boolean('is_learned').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  // Интервальное повторение (внутренние поля, не передаются на фронт)
  lastShownAt: timestamp('last_shown_at', { withTimezone: true }),
  lastLearnedAt: timestamp('last_learned_at', { withTimezone: true }),
  nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
  
  // Статистика обучения
  reviewCount: integer('review_count').notNull().default(0),
  correctCount: integer('correct_count').notNull().default(0),
  incorrectCount: integer('incorrect_count').notNull().default(0),
  
  // Алгоритм SM-2
  currentInterval: integer('current_interval').notNull().default(0),
  repetitions: integer('repetitions').notNull().default(0),
  easeFactor: real('ease_factor').notNull().default(2.5),
  lastRating: integer('last_rating'),
  averageRating: real('average_rating').notNull().default(0),
  
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
  language: text('language'),
  is_guest: boolean('is_guest'),
});

export const contextReadingStates = pgTable(
    'context_reading_states',
    {
        userId: text('user_id').notNull(),
        folderId: text('folder_id').notNull(),
        usedCardIds: text('used_card_ids').array().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.userId, table.folderId] }),
    })
);

export const telegramAuthNonce = pgTable(
    'telegram_auth_nonce',
    {
        nonce: text('nonce').primaryKey(),
        telegramUserId: bigint('telegram_user_id', {mode: 'number'}).notNull(),
        expiresAt: timestamp('expires_at').notNull(),
        usedAt: timestamp('used_at'),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    });

export const externalAccounts = pgTable(
    'external_accounts',
    {
        provider: text('provider').notNull(),
        externalId: text('external_id').notNull(),
        userId: uuid('user_id').notNull(),
        createdAt: timestamp('created_at').defaultNow().notNull(),
    });

export const googleSheetsTokens = pgTable('google_sheets_tokens', {
    user_id: text('user_id').primaryKey(),
    access_token: text('access_token').notNull(),
    refresh_token: text('refresh_token'),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});