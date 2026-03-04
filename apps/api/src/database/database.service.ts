import { Injectable, OnModuleInit, Global } from '@nestjs/common';
import { createClient, Client } from '@libsql/client';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private client: Client;

    onModuleInit() {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url || !authToken) {
            throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be defined.');
        }

        this.client = createClient({
            url,
            authToken,
        });
    }

    get db(): Client {
        return this.client;
    }

    async execute(sql: string, args: any[] = []) {
        return this.client.execute({ sql, args });
    }

    async runTransaction(operations: { sql: string; args?: any[] }[]) {
        return this.client.batch(operations, 'write');
    }
}
