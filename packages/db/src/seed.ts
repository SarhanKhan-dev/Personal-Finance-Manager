import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = createClient({
    url: process.env.DATABASE_URL as string,
    authToken: process.env.DATABASE_AUTH_TOKEN as string,
});

const db = drizzle(client, { schema });

async function seed() {
    console.log('Seeding Database...');

    // 1. Create default user
    const [user] = await db.insert(schema.users).values({
        name: 'Default User',
        email: 'user@example.com',
    }).returning();

    console.log('Created User:', user.name);

    // 2. Create sample Sources
    await db.insert(schema.sources).values([
        { userId: user.id, name: 'Salary', type: 'OWNED', balance: 500000, allowNegative: false },
        { userId: user.id, name: 'Savings Account', type: 'SAVINGS', balance: 200000, allowNegative: false }
    ]);
    console.log('Created Sources.');

    // 3. Create sample Assets
    await db.insert(schema.assets).values([
        { userId: user.id, name: 'Cash', type: 'CASH', balance: 50000, allowNegative: false },
        { userId: user.id, name: 'HBL Bank', type: 'BANK', balance: 150000, allowNegative: false },
        { userId: user.id, name: 'JazzCash', type: 'WALLET', balance: 25000, allowNegative: false },
        { userId: user.id, name: 'Credit Card', type: 'CARD', balance: -10000, allowNegative: true }
    ]);
    console.log('Created Assets.');

    // 4. Create sample Merchants
    await db.insert(schema.merchants).values([
        { userId: user.id, name: 'Salman Bakery' },
        { userId: user.id, name: 'K-Electric' },
        { userId: user.id, name: 'Imtiaz Super Market' }
    ]);
    console.log('Created Merchants.');

    // 5. Create Categories
    const [grocery] = await db.insert(schema.categories).values({
        userId: user.id,
        name: 'Grocery'
    }).returning();

    await db.insert(schema.categories).values({
        userId: user.id,
        name: 'Meat',
        parentId: grocery.id
    });

    const [utilities] = await db.insert(schema.categories).values({
        userId: user.id,
        name: 'Utilities'
    }).returning();

    await db.insert(schema.categories).values({
        userId: user.id,
        name: 'Electricity',
        parentId: utilities.id
    });
    console.log('Created Categories.');

    console.log('Database Seeding Complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
