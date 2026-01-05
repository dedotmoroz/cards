// src/handlers/callbacks/folders.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { InlineKeyboard } from 'grammy';
import { apiClient } from '../../api/client';

export function registerFolders(bot: Bot<BotContext>) {
    bot.callbackQuery(/^folder:/, async (ctx) => {
        const telegramUserId = ctx.from?.id;
        if (!telegramUserId) {
            await ctx.answerCallbackQuery();
            return;
        }

        const folderId = ctx.callbackQuery.data.split(':')[1];
        if (!folderId) {
            await ctx.answerCallbackQuery({ text: 'Некорректная папка' });
            return;
        }

        try {
            ctx.session.state = 'READING';
            ctx.session.folderId = folderId;

            await ctx.answerCallbackQuery();
            await ctx.reply('⏳ Генерирую контекст…');

            const result = await apiClient.telegramContextNext(
                telegramUserId,
                folderId
            );

            ctx.session.lastTranslation = result.translation;

            const keyboard = new InlineKeyboard()
                .text('🇷🇺 Показать перевод', 'translate')
                .row();

            if (!result.completed) {
                keyboard.text('➡️ Далее', 'next');
            }

            await ctx.reply(result.text, { reply_markup: keyboard });
        } catch (err) {
            console.error('folder callback failed', err);

            ctx.session.state = 'IDLE';
            ctx.session.folderId = undefined;

            await ctx.reply(
                'Не удалось загрузить контекст 😕\nПопробуй позже.'
            );
        }
    });
}