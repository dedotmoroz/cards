export interface Folder {
    id: string;
    name: string;
    userId: string;
    sideALanguage: string;
    sideBLanguage: string;
    cardCount?: number;
}

export interface CreateFolderData {
    name: string;
    sideALanguage: string;
    sideBLanguage: string;
}

export interface UpdateFolderData {
    name?: string;
    sideALanguage?: string;
    sideBLanguage?: string;
}
