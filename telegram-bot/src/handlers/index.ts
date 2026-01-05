// src/handlers/index.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../bot';

import { registerStart } from './commands/start';
import { registerFolders } from './callbacks/folders';
import { registerNext } from './callbacks/next';
import { registerTranslate } from './callbacks/translate';

export function registerHandlers(bot: Bot<BotContext>) {
    registerStart(bot);
    registerFolders(bot);
    registerNext(bot);
    registerTranslate(bot);
}