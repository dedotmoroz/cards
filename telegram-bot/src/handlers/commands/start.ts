// src/handlers/commands/start.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { InlineKeyboard } from 'grammy';
import { apiClient } from '../../api/client';

export function registerStart(bot: Bot<BotContext>) {
    bot.command('start', async (ctx) => {
        const telegramUserId = ctx.from?.id;
        if (!telegramUserId) return;

        const me = await apiClient.telegramMe(telegramUserId);

        if (!me.linked) {
            const keyboard = new InlineKeyboard().url(
                '🔐 Подключить аккаунт',
                `${process.env.WEB_APP_URL}/telegram-connect`
            );

            await ctx.reply(
                'Привет 👋\n\nЧтобы начать, подключи аккаунт.',
                { reply_markup: keyboard }
            );
            return;
        }

        // дальше логика…
    });
}