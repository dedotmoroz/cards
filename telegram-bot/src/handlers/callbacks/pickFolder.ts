// src/handlers/callbacks/pickFolder.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../../bot';
import { InlineKeyboard } from 'grammy';
import { apiClient } from '../../api/client';

export function registerPickFolder(bot: Bot<BotContext>) {
    bot.callbackQuery('pick-folder', async (ctx) => {
        const telegramUserId = ctx.from?.id;
        if (!telegramUserId) {
            await ctx.answerCallbackQuery();
            return;
        }

        await ctx.answerCallbackQuery();

        // сбрасываем локальный state
        ctx.session.state = 'IDLE';
        ctx.session.folderId = undefined;
        ctx.session.lastTranslation = undefined;

        const folders = await apiClient.telegramFolders(telegramUserId);

        if (!Array.isArray(folders) || folders.length === 0) {
            await ctx.reply(
                'У тебя пока нет папок 📂\nСоздай первую папку на сайте.'
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