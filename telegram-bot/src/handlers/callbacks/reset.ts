import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { apiClient } from '../../api/client';

export function registerReset(bot: Bot<BotContext>) {
    bot.callbackQuery('reset', async (ctx) => {
        const telegramUserId = ctx.from?.id;
        const folderId = ctx.session.folderId;

        if (!telegramUserId || !folderId) {
            await ctx.answerCallbackQuery({
                text: 'Нет активного контекста',
            });
            return;
        }

        try {
            await ctx.answerCallbackQuery();

            await apiClient.telegramContextReset(
                telegramUserId,
                folderId
            );

            ctx.session.state = 'READING';

            await ctx.reply('🔄 Контекст сброшен. Начинаем заново 👇');

            // сразу показать первый текст
            const result = await apiClient.telegramContextNext(
                telegramUserId,
                folderId
            );

            ctx.session.lastTranslation = result.translation;

            await ctx.reply(result.text, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🇷🇺 Показать перевод', callback_data: 'translate' }],
                        [{ text: '➡️ Далее', callback_data: 'next' }],
                    ],
                },
            });
        } catch (err) {
            console.error('reset failed', err);

            ctx.session.state = 'IDLE';
            ctx.session.folderId = undefined;

            await ctx.reply('Не удалось сбросить контекст 😕');
        }
    });
}