import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class AssetsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        return await this.dbService.db.query.assets.findMany({
            where: eq(schema.assets.userId, userId),
        });
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.assets.findFirst({
            where: and(eq(schema.assets.userId, userId), eq(schema.assets.id, id)),
        });
    }

    async create(userId: string, data: { name: string; type: any; allowNegative?: boolean }) {
        return await this.dbService.db.insert(schema.assets).values({
            userId,
            ...data,
        }).returning();
    }

    async update(userId: string, id: string, data: any) {
        return await this.dbService.db.update(schema.assets)
            .set(data)
            .where(and(eq(schema.assets.userId, userId), eq(schema.assets.id, id)))
            .returning();
    }

    async remove(userId: string, id: string) {
        return await this.dbService.db.delete(schema.assets)
            .where(and(eq(schema.assets.userId, userId), eq(schema.assets.id, id)))
            .returning();
    }
}
