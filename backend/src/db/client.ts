import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const client = postgres({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'flashcards',
});

export const db = drizzle(client);

// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
//
// const pool = new Pool({
//     connectionString: 'postgres://postgres:postgres@localhost:5432/flashcards',
// });
//
// export const db = drizzle(pool);