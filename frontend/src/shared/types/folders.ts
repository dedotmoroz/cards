export interface Folder {
    id: string;
    name: string;
    userId: string;
}

export interface CreateFolderData {
    name: string;
}

export interface UpdateFolderData {
    name: string;
}
