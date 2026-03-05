import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '@finance/db';

import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class DatabaseService implements OnModuleInit {
    private client: Client;
    public db: LibSQLDatabase<typeof schema>;

    onModuleInit() {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('CRITICAL: DATABASE_URL is not set in the environment variables!');
        }

        this.client = createClient({
            url: dbUrl as string,
            authToken: process.env.DATABASE_AUTH_TOKEN,
        });
        this.db = drizzle(this.client, { schema });
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
