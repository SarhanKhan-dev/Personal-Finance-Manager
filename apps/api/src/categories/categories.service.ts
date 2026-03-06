import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
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

        const stats = categoryStats.map(s => ({
            categoryId: s.categoryId,
            totalAmount: Number(s.totalAmount) || 0,
            txCount: Number(s.txCount) || 0
        }));

        return JSON.parse(JSON.stringify({ categories, stats }));
    }

    async findOne(userId: string, id: string) {
        const category = await this.dbService.db.query.categories.findFirst({
            where: and(eq(schema.categories.userId, userId), eq(schema.categories.id, id)),
        });
        return JSON.parse(JSON.stringify(category));
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
