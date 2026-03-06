import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, sql, and } from 'drizzle-orm';

@Injectable()
export class MerchantsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        const merchants = await this.dbService.db.query.merchants.findMany({
            where: eq(schema.merchants.userId, userId),
        });

        const merchantStats = await this.dbService.db.select({
            merchantId: schema.transactions.merchantId,
            totalAmount: sql<number>`sum(${schema.transactions.totalAmount})`,
            txCount: sql<number>`count(${schema.transactions.id})`
        })
            .from(schema.transactions)
            .where(eq(schema.transactions.userId, userId))
            .groupBy(schema.transactions.merchantId);

        const stats = merchantStats.map(s => ({
            merchantId: s.merchantId,
            totalAmount: Number(s.totalAmount) || 0,
            txCount: Number(s.txCount) || 0
        }));

        return JSON.parse(JSON.stringify({ merchants, stats }));
    }

    async findOne(userId: string, id: string) {
        const merchant = await this.dbService.db.query.merchants.findFirst({
            where: and(eq(schema.merchants.userId, userId), eq(schema.merchants.id, id)),
        });
        return JSON.parse(JSON.stringify(merchant));
    }

    async create(userId: string, data: { name: string; defaultCategoryId?: string }) {
        return await this.dbService.db.insert(schema.merchants).values({
            userId,
            ...data
        }).returning();
    }

    async update(userId: string, id: string, data: { name?: string; defaultCategoryId?: string }) {
        return await this.dbService.db.update(schema.merchants)
            .set(data)
            .where(and(eq(schema.merchants.userId, userId), eq(schema.merchants.id, id)))
            .returning();
    }

    async remove(userId: string, id: string) {
        return await this.dbService.db.delete(schema.merchants)
            .where(and(eq(schema.merchants.userId, userId), eq(schema.merchants.id, id)))
            .returning();
    }
}
