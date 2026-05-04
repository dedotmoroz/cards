export type AdminRole = 'admin';

export type AdminListItem = {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
    isGuest: boolean;
    isAdmin: boolean;
    foldersCount: number;
    cardsCount: number;
};

export type AdminUsersListResult = {
    rows: AdminListItem[];
    total: number;
};

export type UserStats = {
    id: string;
    email: string;
    name: string | null;
    createdAt: Date;
    lastLoginAt: Date | null;
    isGuest: boolean;
    isAdmin: boolean;
    language: string | null;
    oauthProvider: string | null;
    foldersCount: number;
    cardsCount: number;
    learnedCardsCount: number;
};

export type AdminAuditAction =
    | 'delete_user'
    | 'impersonate_start'
    | 'impersonate_stop';
