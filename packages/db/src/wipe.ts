import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function wipe() {
    console.log('Wiping Database...');

    try {
        // Order matters due to foreign keys
        await db.execute(sql`DELETE FROM ledger_entries`);
        await db.execute(sql`DELETE FROM transaction_splits`);
        await db.execute(sql`DELETE FROM transaction_lines`);
        await db.execute(sql`DELETE FROM debts`);
        await db.execute(sql`DELETE FROM transactions`);
        await db.execute(sql`DELETE FROM assets`);
        await db.execute(sql`DELETE FROM sources`);
        await db.execute(sql`DELETE FROM merchants`);

        // Recursive table (categories) needs care or just delete all
        await db.execute(sql`DELETE FROM categories`);

        await db.execute(sql`DELETE FROM people`);
        await db.execute(sql`DELETE FROM users`);

        console.log('Database Wipe Complete!');
    } catch (error) {
        console.error('Error wiping database:', error);
    } finally {
        await client.end();
    }
}

wipe();
