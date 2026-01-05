import { ExternalAccountService, ExternalAccountRepository } from '../application/external-account-service';
import { ExternalAccount, ExternalAccountAlreadyBoundError, UserAlreadyHasExternalAccountError } from '../domain/external-account';

const createMockRepo = (): jest.Mocked<ExternalAccountRepository> => ({
    findByProviderAndExternalId: jest.fn(),
    findByProviderAndUserId: jest.fn(),
    save: jest.fn(),
});

describe('ExternalAccountService', () => {
    let repo: jest.Mocked<ExternalAccountRepository>;
    let service: ExternalAccountService;

    beforeEach(() => {
        repo = createMockRepo();
        service = new ExternalAccountService(repo);
    });

    describe('bindExternalAccount', () => {
        it('успешно привязывает внешний аккаунт', async () => {
            repo.findByProviderAndExternalId.mockResolvedValue(null);
            repo.findByProviderAndUserId.mockResolvedValue(null);
            repo.save.mockResolvedValue(undefined);

            await service.bindExternalAccount({
                provider: 'telegram',
                externalId: '123456',
                userId: 'user-123',
            });

            expect(repo.findByProviderAndExternalId).toHaveBeenCalledWith('telegram', '123456');
            expect(repo.findByProviderAndUserId).toHaveBeenCalledWith('telegram', 'user-123');
            expect(repo.save).toHaveBeenCalledTimes(1);
            
            const savedAccount = repo.save.mock.calls[0][0] as ExternalAccount;
            expect(savedAccount.provider).toBe('telegram');
            expect(savedAccount.externalId).toBe('123456');
            expect(savedAccount.userId).toBe('user-123');
            expect(savedAccount.createdAt).toBeInstanceOf(Date);
        });

        it('выбрасывает ошибку, если externalId уже привязан к другому пользователю', async () => {
            const existingAccount = new ExternalAccount({
                provider: 'telegram',
                externalId: '123456',
                userId: 'other-user',
                createdAt: new Date(),
            });

            repo.findByProviderAndExternalId.mockResolvedValue(existingAccount);

            await expect(
                service.bindExternalAccount({
                    provider: 'telegram',
                    externalId: '123456',
                    userId: 'user-123',
                })
            ).rejects.toThrow(ExternalAccountAlreadyBoundError);

            expect(repo.findByProviderAndExternalId).toHaveBeenCalledWith('telegram', '123456');
            expect(repo.findByProviderAndUserId).not.toHaveBeenCalled();
            expect(repo.save).not.toHaveBeenCalled();
        });

        it('выбрасывает ошибку, если пользователь уже имеет аккаунт этого провайдера', async () => {
            const existingAccount = new ExternalAccount({
                provider: 'telegram',
                externalId: '999999',
                userId: 'user-123',
                createdAt: new Date(),
            });

            repo.findByProviderAndExternalId.mockResolvedValue(null);
            repo.findByProviderAndUserId.mockResolvedValue(existingAccount);

            await expect(
                service.bindExternalAccount({
                    provider: 'telegram',
                    externalId: '123456',
                    userId: 'user-123',
                })
            ).rejects.toThrow(UserAlreadyHasExternalAccountError);

            expect(repo.findByProviderAndExternalId).toHaveBeenCalledWith('telegram', '123456');
            expect(repo.findByProviderAndUserId).toHaveBeenCalledWith('telegram', 'user-123');
            expect(repo.save).not.toHaveBeenCalled();
        });

        it('выполняет обе проверки перед сохранением', async () => {
            repo.findByProviderAndExternalId.mockResolvedValue(null);
            repo.findByProviderAndUserId.mockResolvedValue(null);
            repo.save.mockResolvedValue(undefined);

            await service.bindExternalAccount({
                provider: 'telegram',
                externalId: '123456',
                userId: 'user-123',
            });

            // Проверяем, что все методы были вызваны
            expect(repo.findByProviderAndExternalId).toHaveBeenCalledWith('telegram', '123456');
            expect(repo.findByProviderAndUserId).toHaveBeenCalledWith('telegram', 'user-123');
            expect(repo.save).toHaveBeenCalledTimes(1);
        });
    });
});

