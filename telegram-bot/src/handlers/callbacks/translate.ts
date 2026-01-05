// src/handlers/callbacks/translate.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { InlineKeyboard } from 'grammy';

export function registerTranslate(bot: Bot<BotContext>) {
    bot.callbackQuery('translate', async (ctx) => {
        await ctx.answerCallbackQuery();

        const message = ctx.callbackQuery.message;
        if (!message || typeof message.text !== 'string') {
            return;
        }

        if (message.text.includes('— Перевод —')) {
            return;
        }

        const translation = ctx.session.lastTranslation;
        if (!translation) {
            await ctx.reply(
                'Перевод недоступен 😕\nПопробуй следующий текст.'
            );
            return;
        }

        const newText = `${message.text}

— Перевод —
${translation}`;

        const keyboard = new InlineKeyboard().text('➡️ Далее', 'next');

        try {
            await ctx.editMessageText(newText, {
                reply_markup: keyboard,
            });
        } catch {
            await ctx.reply(newText, { reply_markup: keyboard });
        }
    });
}