import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
});

async function dropAll() {
    console.log('Fetching tables...');
    const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");

    for (const row of res.rows) {
        const tableName = row[0];
        console.log(`Dropping table ${tableName}...`);
        await client.execute(`DROP TABLE IF EXISTS "${tableName}"`);
    }

    console.log('Database dropped clean!');
    process.exit(0);
}

dropAll().catch(err => {
    console.error(err);
    process.exit(1);
});
