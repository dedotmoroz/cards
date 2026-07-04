export type FolderSortMode = 'created_desc' | 'name_asc';

export type User = {
    id: string;
    email: string;
    passwordHash: string;
    name?: string;
    createdAt: Date;
    oauthProvider?: string;
    oauthId?: string;
    language?: string;
    isGuest?: boolean;
    lastLoginAt?: Date;
    folderSortMode?: FolderSortMode;
};