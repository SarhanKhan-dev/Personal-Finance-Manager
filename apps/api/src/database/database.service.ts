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
        const dbUrl = process.env.DATABASE_URL || 'libsql://database-pink-cloud-vercel-icfg-lgry9xjonpjevzbmduopcvpa.aws-ap-northeast-1.turso.io';

        this.client = createClient({
            url: dbUrl,
            authToken: process.env.DATABASE_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI2MjAyMDIsImlkIjoiMDE5Y2I4NjUtYmUwMS03MzM5LTkyODYtZDUwOWVkZDJjZmZjIiwicmlkIjoiMjkyNjZmZjktMGIyNS00YmQzLWIxZTctNGI2MGNhZWQyMDViIn0.Xta06sXPijzESYhTQhPRMyJP05ZkCEDPcj_eKvOe4old0J66MEVeml3MYlenzvDRvwrp9wsvDfnMR_xcSZWyDg',
        });
        this.db = drizzle(this.client, { schema });
    }

    async runTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
        return await this.db.transaction(callback);
    }
}
