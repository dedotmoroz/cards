export type User = {
    id: string;
    email: string;
    passwordHash: string;
    name?: string;
    createdAt: Date;
    oauthProvider?: string;
    oauthId?: string;
    language?: string;
};