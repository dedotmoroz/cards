// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: 'postgres://postgres:postgres@localhost:5432/flashcards',
    },
} satisfies Config;