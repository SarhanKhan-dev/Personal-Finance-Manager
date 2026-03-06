import { Injectable, OnModuleInit } from '@nestjs/common';
import { sql } from '@vercel/postgres';
import { drizzle, VercelPgDatabase } from 'drizzle-orm/vercel-postgres';
import * as schema from '@finance/db';

import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

@Injectable()
export class DatabaseService implements OnModuleInit {
    public db: VercelPgDatabase<typeof schema>;

    async onModuleInit() {
        const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gus3koazJ8Zy@ep-odd-recipe-aifowe6z-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

        if (dbUrl) {
            process.env.POSTGRES_URL = dbUrl;
        }

        this.db = drizzle(sql, { schema });

        // Ensure default user exists
        try {
            await this.db.insert(schema.users).values({
                id: 'default-user-id',
                name: 'Default User',
                email: 'user@example.com',
            } as any).onConflictDoNothing();
            console.log('Verified default user existence');
        } catch (e) {
            console.error('Failed to ensure default user:', e);
        }
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
