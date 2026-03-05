import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '@finance/db';

import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });


@Injectable()
export class DatabaseService implements OnModuleInit {
    private client: Client;
    public db: LibSQLDatabase<typeof schema>;

    onModuleInit() {
        const dbUrl = process.env.DATABASE_URL || 'libsql://dummy.turso.io';
        if (!process.env.DATABASE_URL) {
            console.error('CRITICAL: DATABASE_URL is not set in the environment variables!');
        }

        this.client = createClient({
            url: dbUrl,
            authToken: process.env.DATABASE_AUTH_TOKEN || 'dummy',
        });
        this.db = drizzle(this.client, { schema });
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
