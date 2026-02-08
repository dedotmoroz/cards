import { GoogleSheetsService } from '../application/google-sheets-service';
import type { GoogleSheetsTokensRepository } from '../ports/google-sheets-tokens-repository';

const createMockTokensRepo = (): jest.Mocked<GoogleSheetsTokensRepository> => ({
    findByUserId: jest.fn(),
    save: jest.fn(),
    deleteByUserId: jest.fn(),
});

jest.mock('googleapis', () => {
    const valuesGet = jest.fn();
    const create = jest.fn();
    const valuesUpdate = jest.fn();
    (global as any).__googleSheetsTestMocks = { valuesGet, create, valuesUpdate };
    return {
        google: {
            auth: {
                OAuth2: jest.fn().mockImplementation(() => ({
                    setCredentials: jest.fn(),
                })),
            },
            sheets: jest.fn().mockReturnValue({
                spreadsheets: {
                    values: { get: valuesGet, update: valuesUpdate },
                    create,
                },
            }),
        },
    };
});

const getSheetsMocks = () => (global as any).__googleSheetsTestMocks as {
    valuesGet: jest.Mock;
    create: jest.Mock;
    valuesUpdate: jest.Mock;
};

describe('GoogleSheetsService', () => {
    let tokensRepo: jest.Mocked<GoogleSheetsTokensRepository>;
    let service: GoogleSheetsService;

    const clientId = 'test-client-id';
    const clientSecret = 'test-client-secret';

    beforeEach(() => {
        jest.clearAllMocks();
        tokensRepo = createMockTokensRepo();
        service = new GoogleSheetsService(tokensRepo, clientId, clientSecret);
    });

    describe('findQuestionAndAnswerColumnIndexes', () => {
        it('находит колонки "Сторона A" и "Сторона B"', () => {
            const headerRow = ['Сторона A', 'Сторона B'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toEqual({ question: 0, answer: 1 });
        });

        it('находит колонки "Side A" и "Side B"', () => {
            const headerRow = ['Side A', 'Side B'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toEqual({ question: 0, answer: 1 });
        });

        it('находит колонки "Question" и "Answer"', () => {
            const headerRow = ['Question', 'Answer'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toEqual({ question: 0, answer: 1 });
        });

        it('находит колонки в любом порядке', () => {
            const headerRow = ['Answer', 'Other', 'Question'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toEqual({ question: 2, answer: 0 });
        });

        it('возвращает null при отсутствии нужных колонок', () => {
            const headerRow = ['Col1', 'Col2'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toBeNull();
        });

        it('возвращает null при частичном совпадении', () => {
            const headerRow = ['Сторона A'];
            const result = service.findQuestionAndAnswerColumnIndexes(headerRow);
            expect(result).toBeNull();
        });
    });

    describe('hasTokens', () => {
        it('возвращает true когда есть токены', async () => {
            tokensRepo.findByUserId.mockResolvedValue({
                userId: 'user-1',
                accessToken: 'token',
                refreshToken: 'refresh',
                expiresAt: new Date(),
            });

            const result = await service.hasTokens('user-1');
            expect(result).toBe(true);
            expect(tokensRepo.findByUserId).toHaveBeenCalledWith('user-1');
        });

        it('возвращает false когда токенов нет', async () => {
            tokensRepo.findByUserId.mockResolvedValue(null);

            const result = await service.hasTokens('user-1');
            expect(result).toBe(false);
        });
    });

    describe('getValidAccessToken', () => {
        it('выбрасывает ошибку когда токенов нет', async () => {
            tokensRepo.findByUserId.mockResolvedValue(null);

            await expect(service.getValidAccessToken('user-1')).rejects.toThrow(
                'Google Sheets not connected'
            );
        });

        it('возвращает access token когда токен ещё валиден', async () => {
            const futureExpiry = new Date(Date.now() + 3600 * 1000);
            tokensRepo.findByUserId.mockResolvedValue({
                userId: 'user-1',
                accessToken: 'valid-token',
                refreshToken: 'refresh',
                expiresAt: futureExpiry,
            });

            const result = await service.getValidAccessToken('user-1');
            expect(result).toBe('valid-token');
            expect(tokensRepo.save).not.toHaveBeenCalled();
        });
    });

    describe('getSpreadsheetData', () => {
        beforeEach(() => {
            const futureExpiry = new Date(Date.now() + 3600 * 1000);
            tokensRepo.findByUserId.mockResolvedValue({
                userId: 'user-1',
                accessToken: 'valid-token',
                refreshToken: 'refresh',
                expiresAt: futureExpiry,
            });
        });

        it('возвращает данные из таблицы', async () => {
            getSheetsMocks().valuesGet.mockResolvedValue({
                data: {
                    values: [
                        ['Сторона A', 'Сторона B'],
                        ['q1', 'a1'],
                        ['q2', 'a2'],
                    ],
                },
            });

            const result = await service.getSpreadsheetData(
                'user-1',
                'spreadsheet-id',
                'Sheet1'
            );

            expect(result).toEqual([
                ['Сторона A', 'Сторона B'],
                ['q1', 'a1'],
                ['q2', 'a2'],
            ]);
            expect(getSheetsMocks().valuesGet).toHaveBeenCalledWith({
                spreadsheetId: 'spreadsheet-id',
                range: 'Sheet1!A:Z',
            });
        });

        it('возвращает пустой массив при отсутствии данных', async () => {
            getSheetsMocks().valuesGet.mockResolvedValue({ data: {} });

            const result = await service.getSpreadsheetData(
                'user-1',
                'spreadsheet-id'
            );

            expect(result).toEqual([]);
        });
    });

    describe('createSpreadsheetAndWrite', () => {
        beforeEach(() => {
            const futureExpiry = new Date(Date.now() + 3600 * 1000);
            tokensRepo.findByUserId.mockResolvedValue({
                userId: 'user-1',
                accessToken: 'valid-token',
                refreshToken: 'refresh',
                expiresAt: futureExpiry,
            });

            getSheetsMocks().create.mockResolvedValue({
                data: { spreadsheetId: 'new-sheet-id' },
            });
            getSheetsMocks().valuesUpdate.mockResolvedValue({});
        });

        it('создаёт таблицу и записывает карточки', async () => {
            const rows = [
                { question: 'Q1', answer: 'A1' },
                { question: 'Q2', answer: 'A2' },
            ];

            const result = await service.createSpreadsheetAndWrite(
                'user-1',
                'My Cards',
                rows
            );

            expect(result).toEqual({
                spreadsheetId: 'new-sheet-id',
                spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/new-sheet-id',
            });
            expect(getSheetsMocks().create).toHaveBeenCalledWith({
                requestBody: {
                    properties: { title: 'My Cards' },
                    sheets: [{ properties: { title: 'Cards' } }],
                },
            });
            expect(getSheetsMocks().valuesUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    spreadsheetId: 'new-sheet-id',
                    range: 'Cards!A1:B3',
                    requestBody: {
                        values: [
                            ['Сторона A', 'Сторона B'],
                            ['Q1', 'A1'],
                            ['Q2', 'A2'],
                        ],
                    },
                })
            );
        });

        it('выбрасывает ошибку при неудачном создании таблицы', async () => {
            getSheetsMocks().create.mockResolvedValue({ data: {} });

            await expect(
                service.createSpreadsheetAndWrite('user-1', 'Title', [
                    { question: 'Q', answer: 'A' },
                ])
            ).rejects.toThrow('Failed to create spreadsheet');
        });
    });
});
