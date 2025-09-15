import { Client } from 'pg';

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'flashcards',
});

async function testConnection() {
    try {
        await client.connect();
        console.log('✅ Успешно подключено к базе данных PostgreSQL');

        const res = await client.query('SELECT NOW()');
        console.log('🕒 Текущее время на сервере:', res.rows[0]);

    } catch (err) {
        console.error('❌ Ошибка подключения к базе данных:', err);
    } finally {
        await client.end();
    }
}

testConnection();