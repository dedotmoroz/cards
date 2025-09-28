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

export interface CreateFolderData {
  name: string;
}

export interface CreateCardData {
  folderId: string;
  question: string;
  answer: string;
}

export interface UpdateFolderData {
  name: string;
}

export interface UpdateCardData {
  question?: string;
  answer?: string;
}

export interface UpdateCardLearnStatusData {
  isLearned: boolean;
}
