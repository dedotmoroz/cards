import { Bot, session } from 'grammy';
import type { SessionFlavor, Context } from 'grammy';
import { env } from './config/env';

export type SessionData = {
    state: 'IDLE' | 'WAITING_FOLDER' | 'READING';
    folderId?: string;
    lastTranslation?: string;
};

console.log('ENV CHECK', {
    TG_BOT_TOKEN: env.TG_BOT_TOKEN?.slice(0, 10),
    API_URL: env.API_URL,
});

export type BotContext = Context & SessionFlavor<SessionData>;

export function createBot() {
    const bot = new Bot<BotContext>(env.TG_BOT_TOKEN);

    bot.use(
        session({
            initial: (): SessionData => ({
                state: 'IDLE',
            }),
        })
    );

    bot.catch((err) => {
        console.error('❌ Bot error:', err);
    });

    // регистрируем handlers
    registerHandlers(bot);

    return bot;
}

// 👇 ВАЖНО
import { registerHandlers } from './handlers';