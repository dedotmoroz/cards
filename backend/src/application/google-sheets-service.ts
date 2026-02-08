import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import type { GoogleSheetsTokensRepository } from '../ports/google-sheets-tokens-repository';

function createSheetsAuth(clientId: string, clientSecret: string, accessToken: string) {
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ access_token: accessToken });
    return auth;
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const QUESTION_HEADERS = ['Сторона A', 'Side A', 'Question', 'question'];
const ANSWER_HEADERS = ['Сторона B', 'Side B', 'Answer', 'answer'];

export class GoogleSheetsService {
    constructor(
        private readonly tokensRepo: GoogleSheetsTokensRepository,
        private readonly clientId: string,
        private readonly clientSecret: string
    ) {}

    async getValidAccessToken(userId: string): Promise<string> {
        const row = await this.tokensRepo.findByUserId(userId);
        if (!row) {
            throw new Error(
                'Google Sheets not connected. Use menu → "Connect Google Sheets", then authorize. ' +
                'If you already did, ensure migration 0004_google_sheets_tokens was applied and try connecting again.'
            );
        }

        const now = new Date();
        const expiresAt = new Date(row.expiresAt);
        const bufferMs = 5 * 60 * 1000; // refresh 5 min before expiry

        if (expiresAt.getTime() - bufferMs > now.getTime()) {
            return row.accessToken;
        }

        if (!row.refreshToken) {
            throw new Error('Google Sheets token expired. Please reconnect.');
        }

        const oauth2Client = new OAuth2Client(this.clientId, this.clientSecret);
        oauth2Client.setCredentials({
            refresh_token: row.refreshToken,
        });

        const { credentials } = await oauth2Client.refreshAccessToken();
        if (!credentials.access_token || !credentials.expiry_date) {
            throw new Error('Failed to refresh Google token');
        }

        await this.tokensRepo.save({
            userId,
            accessToken: credentials.access_token,
            refreshToken: credentials.refresh_token ?? row.refreshToken,
            expiresAt: new Date(credentials.expiry_date),
        });

        return credentials.access_token;
    }

    async getSpreadsheetData(
        userId: string,
        spreadsheetId: string,
        sheetName: string = 'Sheet1'
    ): Promise<string[][]> {
        const accessToken = await this.getValidAccessToken(userId);
        const auth = createSheetsAuth(this.clientId, this.clientSecret, accessToken);
        const sheets = google.sheets({ version: 'v4', auth });
        const range = `${sheetName}!A:Z`;
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        const rows = (response.data.values || []) as string[][];
        return rows;
    }

    findQuestionAndAnswerColumnIndexes(headerRow: string[]): { question: number; answer: number } | null {
        let questionIdx = -1;
        let answerIdx = -1;
        for (let i = 0; i < headerRow.length; i++) {
            const cell = (headerRow[i] || '').toString().trim();
            if (QUESTION_HEADERS.some((h) => cell === h || cell.toLowerCase() === h.toLowerCase())) {
                questionIdx = i;
            }
            if (ANSWER_HEADERS.some((h) => cell === h || cell.toLowerCase() === h.toLowerCase())) {
                answerIdx = i;
            }
        }
        if (questionIdx >= 0 && answerIdx >= 0) {
            return { question: questionIdx, answer: answerIdx };
        }
        return null;
    }

    async createSpreadsheetAndWrite(
        userId: string,
        title: string,
        rows: Array<{ question: string; answer: string }>
    ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
        const accessToken = await this.getValidAccessToken(userId);
        const auth = createSheetsAuth(this.clientId, this.clientSecret, accessToken);
        const sheets = google.sheets({ version: 'v4', auth });

        const createRes = await sheets.spreadsheets.create({
            requestBody: {
                properties: { title },
                sheets: [{ properties: { title: 'Cards' } }],
            },
        });

        const spreadsheetId = createRes.data.spreadsheetId;
        if (!spreadsheetId) {
            throw new Error('Failed to create spreadsheet');
        }

        const values: string[][] = [
            ['Сторона A', 'Сторона B'],
            ...rows.map((r) => [r.question, r.answer]),
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Cards!A1:B' + (values.length),
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });

        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
        return { spreadsheetId, spreadsheetUrl };
    }

    async hasTokens(userId: string): Promise<boolean> {
        const row = await this.tokensRepo.findByUserId(userId);
        return !!row;
    }
}
