import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, and, between, sql } from 'drizzle-orm';
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class ReportsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getSummary(userId: string, from: string, to: string) {
        const db = this.dbService.db;

        const transactionsInRange = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.userId, userId),
                between(schema.transactions.occurredAt, from, to),
            ),
            with: {
                category: true
            }
        });

        const incomeTxs = transactionsInRange.filter(t => t.type === 'INCOME');
        const expenseTxs = transactionsInRange.filter(t => t.type === 'EXPENSE');

        const totalIncome = incomeTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);
        const totalExpense = expenseTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

        const days = Math.max(1, differenceInDays(parseISO(to), parseISO(from)) + 1);

        const byCategory = await db.select({
            id: schema.transactions.categoryId,
            name: schema.categories.name,
            amount: sql<number>`sum(${schema.transactions.totalAmount})`,
            count: sql<number>`count(${schema.transactions.id})`
        })
            .from(schema.transactions)
            .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
            .where(and(
                eq(schema.transactions.userId, userId),
                eq(schema.transactions.type, 'EXPENSE'),
                between(schema.transactions.occurredAt, from, to)
            ))
            .groupBy(schema.transactions.categoryId);

        // Calculate percentages for categories
        const totalByCat = byCategory.reduce((acc, c) => acc + Number(c.amount), 0);
        const mappedCategories = byCategory.map(c => ({
            ...c,
            percentage: totalByCat > 0 ? Math.round((Number(c.amount) / totalByCat) * 100) : 0
        })).sort((a, b) => b.amount - a.amount).slice(0, 5);

        const byMerchant = await db.select({
            id: schema.transactions.merchantId,
            name: schema.merchants.name,
            amount: sql<number>`sum(${schema.transactions.totalAmount})`,
            count: sql<number>`count(${schema.transactions.id})`
        })
            .from(schema.transactions)
            .leftJoin(schema.merchants, eq(schema.transactions.merchantId, schema.merchants.id))
            .where(and(
                eq(schema.transactions.userId, userId),
                eq(schema.transactions.type, 'EXPENSE'),
                between(schema.transactions.occurredAt, from, to)
            ))
            .groupBy(schema.transactions.merchantId);

        const totalByMerch = byMerchant.reduce((acc, m) => acc + Number(m.amount), 0);
        const mappedMerchants = byMerchant.map(m => ({
            ...m,
            percentage: totalByMerch > 0 ? Math.round((Number(m.amount) / totalByMerch) * 100) : 0
        })).sort((a, b) => b.amount - a.amount).slice(0, 5);

        const topCategory = mappedCategories[0]?.name || 'N/A';

        return {
            expenses: {
                total: totalExpense,
                avgPerDay: Math.round(totalExpense / days)
            },
            income: {
                total: totalIncome,
                avgPerDay: Math.round(totalIncome / days)
            },
            transactions: {
                count: transactionsInRange.length,
                topCategory
            },
            byCategory: mappedCategories,
            byMerchant: mappedMerchants
        };
    }
}
