export interface GoogleSheetsTokenRow {
    userId: string;
    accessToken: string;
    refreshToken: string | null;
    expiresAt: Date;
}

export interface GoogleSheetsTokensRepository {
    findByUserId(userId: string): Promise<GoogleSheetsTokenRow | null>;
    save(row: GoogleSheetsTokenRow): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
