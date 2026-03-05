import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class SourcesService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        return await this.dbService.db.query.sources.findMany({
            where: eq(schema.sources.userId, userId),
        });
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.sources.findFirst({
            where: and(eq(schema.sources.userId, userId), eq(schema.sources.id, id)),
        });
    }

    async create(userId: string, data: { name: string; type: any; allowNegative?: boolean }) {
        return await this.dbService.db.insert(schema.sources).values({
            userId,
            ...data,
        }).returning();
    }

    async update(userId: string, id: string, data: any) {
        return await this.dbService.db.update(schema.sources)
            .set(data)
            .where(and(eq(schema.sources.userId, userId), eq(schema.sources.id, id)))
            .returning();
    }

    async remove(userId: string, id: string) {
        return await this.dbService.db.delete(schema.sources)
            .where(and(eq(schema.sources.userId, userId), eq(schema.sources.id, id)))
            .returning();
    }
}
