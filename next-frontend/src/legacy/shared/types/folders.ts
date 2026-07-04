export interface Folder {
    id: string;
    name: string;
    userId: string;
    sideALanguage: string;
    sideBLanguage: string;
    cardCount?: number;
    createdAt?: string;
    pinned?: boolean;
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
    pinned?: boolean;
}
