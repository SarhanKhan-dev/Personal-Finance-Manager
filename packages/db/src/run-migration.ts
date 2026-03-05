import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
});

async function run() {
    try {
        // Only run the ALTER TABLE statements from migration 0001
        await client.executeMultiple(`
ALTER TABLE transactions ADD COLUMN person_id TEXT REFERENCES people(id);
`);
        console.log('✅ Added person_id');
    } catch (e: any) {
        if (e.message?.includes('duplicate column')) {
            console.log('⚠️  person_id already exists');
        } else throw e;
    }

    const cols = [
        `ALTER TABLE transactions ADD COLUMN from_asset_id TEXT REFERENCES assets(id)`,
        `ALTER TABLE transactions ADD COLUMN to_asset_id TEXT REFERENCES assets(id)`,
        `ALTER TABLE transactions ADD COLUMN from_owner_id TEXT REFERENCES sources(id)`,
        `ALTER TABLE transactions ADD COLUMN to_owner_id TEXT REFERENCES sources(id)`,
    ];

    for (const col of cols) {
        try {
            await client.execute(col);
            console.log(`✅ ${col.split('ADD COLUMN ')[1].split(' ')[0]}`);
        } catch (e: any) {
            if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
                console.log(`⚠️  Column already exists: ${col.split('ADD COLUMN ')[1].split(' ')[0]}`);
            } else {
                console.error(e.message);
            }
        }
    }
    console.log('Done!');
    process.exit(0);
}

run().catch(console.error);
