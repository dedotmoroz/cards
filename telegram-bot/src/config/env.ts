// src/config/env.ts
import 'dotenv/config';

export const env = {
    TG_BOT_TOKEN: process.env.TG_BOT_TOKEN!,
    API_URL: process.env.API_URL!,
    BOT_SERVICE_JWT: process.env.BOT_SERVICE_JWT!,
    WEB_APP_URL: process.env.WEB_APP_URL!,
};

// защитная проверка (очень рекомендую)
if (!env.TG_BOT_TOKEN) {
    throw new Error('TG_BOT_TOKEN is not set');
}