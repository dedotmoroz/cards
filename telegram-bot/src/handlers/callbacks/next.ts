// src/handlers/callbacks/next.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { InlineKeyboard } from 'grammy';
import { apiClient } from '../../api/client';

export function registerNext(bot: Bot<BotContext>) {
    bot.callbackQuery('next', async (ctx) => {
        const telegramUserId = ctx.from?.id;
        if (!telegramUserId) {
            await ctx.answerCallbackQuery();
            return;
        }

        if (ctx.session.state !== 'READING' || !ctx.session.folderId) {
            await ctx.answerCallbackQuery({
                text: 'Сначала выбери папку',
            });
            return;
        }

        const folderId = ctx.session.folderId;

        try {
            await ctx.answerCallbackQuery();

            const result = await apiClient.telegramContextNext(
                telegramUserId,
                folderId
            );

            if (result.completed) {
                ctx.session.state = 'IDLE';
                ctx.session.folderId = undefined;

                await ctx.reply(
                    '🎉 Контекстное чтение завершено!\nВыбери другую папку командой /start'
                );
                return;
            }

            ctx.session.lastTranslation = result.translation;

            const keyboard = new InlineKeyboard()
                .text('🇷🇺 Показать перевод', 'translate')
                .row()
                .text('➡️ Далее', 'next');

            await ctx.reply(result.text, { reply_markup: keyboard });
        } catch (err) {
            console.error('next callback failed', err);

            ctx.session.state = 'IDLE';
            ctx.session.folderId = undefined;

            await ctx.reply(
                'Не удалось получить следующий текст 😕\nПопробуй позже.'
            );
        }
    });
}