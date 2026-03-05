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

    onModuleInit() {
        const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_gus3koazJ8Zy@ep-odd-recipe-aifowe6z-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

        // Vercel postgres automatically uses the standard env vars (POSTGRES_URL or DATABASE_URL).
        // For Drizzle, you pass the `sql` client (which automatically consumes 'POSTGRES_URL' inside Vercel or locally).
        // Since we want to ensure it connects even locally:
        if (dbUrl) {
            process.env.POSTGRES_URL = dbUrl;
        }

        this.db = drizzle(sql, { schema });
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
