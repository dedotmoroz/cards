import {
    ExternalAccount,
    ExternalAccountProvider,
    ExternalAccountAlreadyBoundError,
    UserAlreadyHasExternalAccountError
} from '../domain/external-account';

export interface ExternalAccountRepository {
    findByProviderAndExternalId(
        provider: ExternalAccountProvider,
        externalId: string
    ): Promise<ExternalAccount | null>;

    findByProviderAndUserId(
        provider: ExternalAccountProvider,
        userId: string
    ): Promise<ExternalAccount | null>;

    save(account: ExternalAccount): Promise<void>;
}

export class ExternalAccountService {
    constructor(
        private readonly repository: ExternalAccountRepository
    ) {}

    async bindExternalAccount(params: {
        provider: ExternalAccountProvider;
        externalId: string;
        userId: string;
    }): Promise<void> {
        const { provider, externalId, userId } = params;

        // 1️⃣ externalId уже привязан?
        const existingByExternal =
            await this.repository.findByProviderAndExternalId(
                provider,
                externalId
            );

        if (existingByExternal) {
            throw new ExternalAccountAlreadyBoundError(provider, externalId);
        }

        // 2️⃣ user уже имеет external-аккаунт этого провайдера?
        const existingByUser =
            await this.repository.findByProviderAndUserId(provider, userId);

        if (existingByUser) {
            throw new UserAlreadyHasExternalAccountError(provider, userId);
        }

        // 3️⃣ создаём bind
        const account = new ExternalAccount({
            provider,
            externalId,
            userId,
            createdAt: new Date(),
        });

        await this.repository.save(account);
    }

    async findUserByTelegramUserId(
        telegramUserId: number
    ): Promise<{ userId: string } | null> {
        const account =
            await this.repository.findByProviderAndExternalId(
                'telegram',
                telegramUserId.toString()
            );

        if (!account) return null;

        return { userId: account.userId };
    }

    async findByProviderAndExternalId(
        provider: ExternalAccountProvider,
        externalId: string
    ): Promise<ExternalAccount | null> {
        return this.repository.findByProviderAndExternalId(provider, externalId);
    }
}