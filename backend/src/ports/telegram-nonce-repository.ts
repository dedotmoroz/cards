export interface TelegramAuthNonce {
    nonce: string;
    telegramUserId: number;
    expiresAt: Date;
    usedAt: Date | null;
}

export interface TelegramNonceRepository {
    save(nonce: TelegramAuthNonce): Promise<void>;

    findByNonce(nonce: string): Promise<TelegramAuthNonce | null>;

    markUsed(nonce: string): Promise<boolean>;
    /**
     * @returns true если успешно помечен как использованный
     *          false если nonce не найден или уже использован
     */
}