import { z } from 'zod';
import {
    FOLDER_SIDE_A_LANGUAGE_CODES,
    FOLDER_SIDE_B_LANGUAGE_CODES,
} from '../../shared/folder-languages';

const FolderSideALanguageSchema = z.enum(FOLDER_SIDE_A_LANGUAGE_CODES);
const FolderSideBLanguageSchema = z.enum(FOLDER_SIDE_B_LANGUAGE_CODES);

export const CreateCardDTO = z.object({
  folderId: z.string().uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
  questionSentences: z.string().optional(),
  answerSentences: z.string().optional(),
}).describe('CreateCardDTO');

export const CardDTO = z.object({
  id: z.string().uuid(),
  folderId: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  questionSentences: z.string().optional(),
  answerSentences: z.string().optional(),
  isLearned: z.boolean(),
  createdAt: z.date(),
}).describe('CardDTO');

export const CardSearchResultDTO = CardDTO.extend({
  folderName: z.string().optional(),
}).describe('CardSearchResultDTO');

export const UpdateCardDTO = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  questionSentences: z.string().nullable().optional(),
  answerSentences: z.string().nullable().optional(),
}).describe('UpdateCardDTO');

export const MarkAsLearnedDTO = z.object({}).describe('MarkAsLearnedDTO'); // пустая схема

export const ReviewCardDTO = z.object({
  outcome: z.enum(['know', 'dontknow']),
}).describe('ReviewCardDTO');

export const CreateFolderDTO = z.object({
  userId: z.string().uuid().describe('ID пользователя'),
  name: z.string().min(1).describe('Название папки'),
  sideALanguage: FolderSideALanguageSchema,
  sideBLanguage: FolderSideBLanguageSchema,
}).describe('CreateFolderDTO');

export const UpdateFolderDTO = z.object({
  name: z.string().min(1).optional(),
  sideALanguage: FolderSideALanguageSchema.optional(),
  sideBLanguage: FolderSideBLanguageSchema.optional(),
  pinned: z.boolean().optional(),
}).describe('UpdateFolderDTO');

export const FolderSortModeSchema = z.enum(['created_desc', 'name_asc']);

export const FolderDTO = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  sideALanguage: z.string(),
  sideBLanguage: z.string(),
  createdAt: z.string().datetime(),
  pinned: z.boolean(),
  cardCount: z.number().int().min(0).optional(),
}).describe('FolderDTO');

export const CreateUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6), // если нужна регистрация
});

export const LoginDTO = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const GoogleLoginDTO = z.object({
  credential: z.string(), // id_token от Google
});

export type CreateCardDTO = z.infer<typeof CreateCardDTO>;
export type CardDTO = z.infer<typeof CardDTO>;
export type UpdateCardDTO = z.infer<typeof UpdateCardDTO>;
export type ReviewCardDTO = z.infer<typeof ReviewCardDTO>;
export type CreateFolderDTO = z.infer<typeof CreateFolderDTO>;
export type UpdateFolderDTO = z.infer<typeof UpdateFolderDTO>;
export type FolderDTO = z.infer<typeof FolderDTO>;