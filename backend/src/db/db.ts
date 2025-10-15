// src/adapters/db/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

console.log('process.env.DATABASE_URL', process.env.DATABASE_URL)
const pool = new Pool(
    { connectionString: process.env.DATABASE_URL }
);

export const db = drizzle(pool, { schema });