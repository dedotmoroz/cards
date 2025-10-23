export interface Folder {
  id: string;
  name: string;
  userId: string;
}

export interface Card {
  id: string;
  question: string;
  answer: string;
  isLearned: boolean;
  folderId: string;
}

export interface CreateCardData {
  question: string;
  answer: string;
  folderId: string;
}

export interface UpdateCardData {
  question?: string;
  answer?: string;
}

export interface UpdateCardLearnStatusData {
  isLearned: boolean;
}