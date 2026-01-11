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

        // ❌ НЕ привязан
        if (!me.linked) {

            const { nonce } = await apiClient.telegramAuthNonce(telegramUserId);

            const keyboard = new InlineKeyboard().url(
                '🔐 Подключить аккаунт',
                `${process.env.WEB_APP_URL}/telegram-connect?nonce=${encodeURIComponent(nonce)}`
            );

            await ctx.reply(
                'Привет 👋\n\nЧтобы начать, подключи аккаунт.',
                { reply_markup: keyboard }
            );
            return;
        }

        // ✅ ПРИВЯЗАН — ПОКАЗЫВАЕМ ПАПКИ
        const folders = await apiClient.telegramFolders(telegramUserId);

        if (folders.length === 0) {
            await ctx.reply(
                'У тебя пока нет папок 📂\n\nСоздай первую папку на сайте.'
            );
            return;
        }

        const keyboard = new InlineKeyboard();
        for (const folder of folders) {
            keyboard.text(folder.name, `folder:${folder.id}`).row();
        }

        await ctx.reply(
            'Выбери папку для контекстного изучения 👇',
            { reply_markup: keyboard }
        );

    });
}