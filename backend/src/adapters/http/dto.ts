import { z } from 'zod';

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

export const UpdateCardDTO = z.object({
  question: z.string().min(1).optional(),
  answer: z.string().min(1).optional(),
  questionSentences: z.string().nullable().optional(),
  answerSentences: z.string().nullable().optional(),
}).describe('UpdateCardDTO');

export const MarkAsLearnedDTO = z.object({}).describe('MarkAsLearnedDTO'); // пустая схема

export const CreateFolderDTO = z.object({
  userId: z.string().uuid().describe('ID пользователя'),
  name: z.string().min(1).describe('Название папки'),
}).describe('CreateFolderDTO');

export const FolderDTO = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
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
export type CreateFolderDTO = z.infer<typeof CreateFolderDTO>;
export type FolderDTO = z.infer<typeof FolderDTO>;