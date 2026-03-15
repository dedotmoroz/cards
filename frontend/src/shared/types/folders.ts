export interface Folder {
    id: string;
    name: string;
    userId: string;
    cardCount?: number;
}

export interface CreateFolderData {
    name: string;
}

export interface UpdateFolderData {
    name: string;
}
