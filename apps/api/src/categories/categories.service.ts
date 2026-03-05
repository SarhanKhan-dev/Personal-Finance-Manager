import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, sql, and } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        const categories = await this.dbService.db.query.categories.findMany({
            where: eq(schema.categories.userId, userId),
        });

        const categoryStats = await this.dbService.db.select({
            categoryId: schema.transactions.categoryId,
            totalAmount: sql<number>`sum(${schema.transactions.totalAmount})`,
            txCount: sql<number>`count(${schema.transactions.id})`
        })
            .from(schema.transactions)
            .where(eq(schema.transactions.userId, userId))
            .groupBy(schema.transactions.categoryId);

        return {
            categories,
            stats: categoryStats
        };
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.categories.findFirst({
            where: and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)),
        });
    }

    async create(userId: string, data: { name: string; parentId?: string }) {
        return await this.dbService.db.insert(schema.categories).values({
            userId,
            ...data
        }).returning();
    }

    async update(userId: string, id: string, data: { name?: string; parentId?: string }) {
        return await this.dbService.db.update(schema.categories)
            .set(data)
            .where(and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)))
            .returning();
    }

    async remove(userId: string, id: string) {
        return await this.dbService.db.delete(schema.categories)
            .where(and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)))
            .returning();
    }
}
