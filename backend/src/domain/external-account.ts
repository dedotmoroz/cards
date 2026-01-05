export type ExternalAccountProvider = 'telegram';
// в будущем: 'google' | 'apple' | 'whatsapp' | ...

export interface ExternalAccountProps {
    provider: ExternalAccountProvider;
    externalId: string;
    userId: string;
    createdAt: Date;
}

export class ExternalAccount {
    readonly provider: ExternalAccountProvider;
    readonly externalId: string;
    readonly userId: string;
    readonly createdAt: Date;

    constructor(props: ExternalAccountProps) {
        this.provider = props.provider;
        this.externalId = props.externalId;
        this.userId = props.userId;
        this.createdAt = props.createdAt;
    }
}

export class ExternalAccountAlreadyBoundError extends Error {
    constructor(provider: string, externalId: string) {
        super(
            `External account already bound: provider=${provider}, externalId=${externalId}`
        );
        this.name = 'ExternalAccountAlreadyBoundError';
    }
}

export class UserAlreadyHasExternalAccountError extends Error {
    constructor(provider: string, userId: string) {
        super(
            `User already has external account for provider=${provider}, userId=${userId}`
        );
        this.name = 'UserAlreadyHasExternalAccountError';
    }
}