// src/handlers/index.ts
import type { Bot } from 'grammy';
import type { BotContext } from '../bot';

import { registerStart } from './commands/start';
import { registerFoldersCommand } from './commands/folders';
import { registerFolders } from './callbacks/folders';
import { registerNext } from './callbacks/next';
import { registerTranslate } from './callbacks/translate';
import { registerReset } from './callbacks/reset';
import { registerPickFolder } from './callbacks/pickFolder';

export function registerHandlers(bot: Bot<BotContext>) {
    registerStart(bot);
    registerFolders(bot);
    registerNext(bot);
    registerTranslate(bot);
    registerReset(bot);
    registerPickFolder(bot);
    registerFoldersCommand(bot);
}