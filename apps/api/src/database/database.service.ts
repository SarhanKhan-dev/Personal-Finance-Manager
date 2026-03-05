import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '@finance/db/src/schema';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class DatabaseService implements OnModuleInit {
    private client: Client;
    public db: LibSQLDatabase<typeof schema>;

    onModuleInit() {
        this.client = createClient({
            url: process.env.DATABASE_URL || 'file:local.db',
            authToken: process.env.DATABASE_AUTH_TOKEN,
        });
        this.db = drizzle(this.client, { schema });
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
