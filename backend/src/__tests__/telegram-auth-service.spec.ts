import { TelegramAuthService, InvalidOrExpiredNonceError } from '../application/telegram-auth-service';
import { TelegramNonceRepository, TelegramAuthNonce } from '../ports/telegram-nonce-repository';
import { ExternalAccountService } from '../application/external-account-service';
import { ExternalAccountAlreadyBoundError, UserAlreadyHasExternalAccountError } from '../domain/external-account';

const createMockNonceRepo = (): jest.Mocked<TelegramNonceRepository> => ({
    save: jest.fn(),
    findByNonce: jest.fn(),
    markUsed: jest.fn(),
});

const createMockExternalAccountService = (): jest.Mocked<ExternalAccountService> => ({
    bindExternalAccount: jest.fn(),
} as any);

describe('TelegramAuthService', () => {
    let nonceRepo: jest.Mocked<TelegramNonceRepository>;
    let externalAccountService: jest.Mocked<ExternalAccountService>;
    let service: TelegramAuthService;

    beforeEach(() => {
        nonceRepo = createMockNonceRepo();
        externalAccountService = createMockExternalAccountService();
        service = new TelegramAuthService(nonceRepo, externalAccountService);
    });

    describe('createNonce', () => {
        it('создает новый nonce для Telegram пользователя', async () => {
            nonceRepo.save.mockResolvedValue(undefined);

            const result = await service.createNonce(123456);

            expect(result.nonce).toBeDefined();
            expect(result.nonce.length).toBeGreaterThan(0);
            expect(nonceRepo.save).toHaveBeenCalledTimes(1);

            const savedNonce = nonceRepo.save.mock.calls[0][0] as TelegramAuthNonce;
            expect(savedNonce.telegramUserId).toBe(123456);
            expect(savedNonce.nonce).toBe(result.nonce);
            expect(savedNonce.usedAt).toBeNull();
            expect(savedNonce.expiresAt).toBeInstanceOf(Date);
            
            // Проверяем, что expiresAt примерно через 5 минут
            const now = Date.now();
            const expiresAtTime = savedNonce.expiresAt.getTime();
            const expectedExpiresAt = now + 5 * 60 * 1000;
            expect(Math.abs(expiresAtTime - expectedExpiresAt)).toBeLessThan(1000); // допуск 1 секунда
        });

        it('создает уникальные nonce при каждом вызове', async () => {
            nonceRepo.save.mockResolvedValue(undefined);

            const result1 = await service.createNonce(123456);
            const result2 = await service.createNonce(123456);

            expect(result1.nonce).not.toBe(result2.nonce);
        });
    });

    describe('bindByNonce', () => {
        const validNonce = 'valid-nonce-123';
        const telegramUserId = 123456;
        const userId = 'user-123';

        const createValidNonce = (): TelegramAuthNonce => ({
            nonce: validNonce,
            telegramUserId,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // через 10 минут
            usedAt: null,
        });

        it('успешно привязывает аккаунт по валидному nonce', async () => {
            const nonceRecord = createValidNonce();
            nonceRepo.findByNonce.mockResolvedValue(nonceRecord);
            nonceRepo.markUsed.mockResolvedValue(true);
            externalAccountService.bindExternalAccount.mockResolvedValue(undefined);

            await service.bindByNonce({ nonce: validNonce, userId });

            expect(nonceRepo.findByNonce).toHaveBeenCalledWith(validNonce);
            expect(nonceRepo.markUsed).toHaveBeenCalledWith(validNonce);
            expect(externalAccountService.bindExternalAccount).toHaveBeenCalledWith({
                provider: 'telegram',
                externalId: String(telegramUserId),
                userId,
            });
        });

        it('выбрасывает ошибку, если nonce не найден', async () => {
            nonceRepo.findByNonce.mockResolvedValue(null);

            await expect(
                service.bindByNonce({ nonce: 'invalid-nonce', userId })
            ).rejects.toThrow(InvalidOrExpiredNonceError);

            expect(nonceRepo.findByNonce).toHaveBeenCalledWith('invalid-nonce');
            expect(nonceRepo.markUsed).not.toHaveBeenCalled();
            expect(externalAccountService.bindExternalAccount).not.toHaveBeenCalled();
        });

        it('выбрасывает ошибку, если nonce уже использован', async () => {
            const usedNonce: TelegramAuthNonce = {
                nonce: validNonce,
                telegramUserId,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                usedAt: new Date(), // уже использован
            };
            nonceRepo.findByNonce.mockResolvedValue(usedNonce);

            await expect(
                service.bindByNonce({ nonce: validNonce, userId })
            ).rejects.toThrow(InvalidOrExpiredNonceError);

            expect(nonceRepo.findByNonce).toHaveBeenCalledWith(validNonce);
            expect(nonceRepo.markUsed).not.toHaveBeenCalled();
            expect(externalAccountService.bindExternalAccount).not.toHaveBeenCalled();
        });

        it('выбрасывает ошибку, если nonce истек', async () => {
            const expiredNonce: TelegramAuthNonce = {
                nonce: validNonce,
                telegramUserId,
                expiresAt: new Date(Date.now() - 1000), // истек 1 секунду назад
                usedAt: null,
            };
            nonceRepo.findByNonce.mockResolvedValue(expiredNonce);

            await expect(
                service.bindByNonce({ nonce: validNonce, userId })
            ).rejects.toThrow(InvalidOrExpiredNonceError);

            expect(nonceRepo.findByNonce).toHaveBeenCalledWith(validNonce);
            expect(nonceRepo.markUsed).not.toHaveBeenCalled();
            expect(externalAccountService.bindExternalAccount).not.toHaveBeenCalled();
        });

        it('выбрасывает ошибку, если markUsed возвращает false', async () => {
            const nonceRecord = createValidNonce();
            nonceRepo.findByNonce.mockResolvedValue(nonceRecord);
            nonceRepo.markUsed.mockResolvedValue(false); // не удалось пометить как использованный

            await expect(
                service.bindByNonce({ nonce: validNonce, userId })
            ).rejects.toThrow(InvalidOrExpiredNonceError);

            expect(nonceRepo.findByNonce).toHaveBeenCalledWith(validNonce);
            expect(nonceRepo.markUsed).toHaveBeenCalledWith(validNonce);
            expect(externalAccountService.bindExternalAccount).not.toHaveBeenCalled();
        });

        it('прокидывает ошибку, если bindExternalAccount выбрасывает ExternalAccountAlreadyBoundError', async () => {
            const nonceRecord = createValidNonce();
            nonceRepo.findByNonce.mockResolvedValue(nonceRecord);
            nonceRepo.markUsed.mockResolvedValue(true);
            externalAccountService.bindExternalAccount.mockRejectedValue(
                new ExternalAccountAlreadyBoundError('telegram', String(telegramUserId))
            );

            await expect(
                service.bindByNonce({ nonce: validNonce, userId })
            ).rejects.toThrow(ExternalAccountAlreadyBoundError);

            expect(nonceRepo.markUsed).toHaveBeenCalledWith(validNonce);
            // Важно: nonce уже помечен как использованный, даже если привязка не удалась
        });

        it('прокидывает ошибку, если bindExternalAccount выбрасывает UserAlreadyHasExternalAccountError', async () => {
            const nonceRecord = createValidNonce();
            nonceRepo.findByNonce.mockResolvedValue(nonceRecord);
            nonceRepo.markUsed.mockResolvedValue(true);
            externalAccountService.bindExternalAccount.mockRejectedValue(
                new UserAlreadyHasExternalAccountError('telegram', userId)
            );

            await expect(
                service.bindByNonce({ nonce: validNonce, userId })
            ).rejects.toThrow(UserAlreadyHasExternalAccountError);

            expect(nonceRepo.markUsed).toHaveBeenCalledWith(validNonce);
        });

        it('выполняет все операции в правильной последовательности', async () => {
            const nonceRecord = createValidNonce();
            nonceRepo.findByNonce.mockResolvedValue(nonceRecord);
            nonceRepo.markUsed.mockResolvedValue(true);
            externalAccountService.bindExternalAccount.mockResolvedValue(undefined);

            await service.bindByNonce({ nonce: validNonce, userId });

            // Проверяем, что все методы были вызваны
            expect(nonceRepo.findByNonce).toHaveBeenCalledWith(validNonce);
            expect(nonceRepo.markUsed).toHaveBeenCalledWith(validNonce);
            expect(externalAccountService.bindExternalAccount).toHaveBeenCalledWith({
                provider: 'telegram',
                externalId: String(telegramUserId),
                userId,
            });
        });
    });
});

