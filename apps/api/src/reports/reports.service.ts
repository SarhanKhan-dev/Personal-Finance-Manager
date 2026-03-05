import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and, between, sql, desc, or } from 'drizzle-orm';
import { differenceInDays, parseISO } from 'date-fns';

@Injectable()
export class ReportsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getDashboardData(userId: string, from: string, to: string) {
        const db = this.dbService.db;

        // 1. Transaction Aggregates (Income vs Expense)
        const transactionsInRange = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.userId, userId),
                between(schema.transactions.occurredAt, from, to)
            )
        });

        const incomeTxs = transactionsInRange.filter(t => t.type === 'INCOME');
        const expenseTxs = transactionsInRange.filter(t => t.type === 'EXPENSE');

        const totalIncome = incomeTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);
        const totalExpense = expenseTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

        // 2. Top Spending Category (for the KPIs)
        const byCategoryRaw = await db.select({
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
            .groupBy(schema.transactions.categoryId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        const topCategoryData = byCategoryRaw[0] || { name: 'None', amount: 0 };

        // 3. Debts Overview
        const debts = await db.query.debts.findMany({
            where: eq(schema.debts.userId, userId),
            with: { person: true }
        });

        const totalDebtPayable = debts
            .filter(d => d.kind === 'PAYABLE')
            .reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);

        const totalDebtReceivable = debts
            .filter(d => d.kind === 'RECEIVABLE')
            .reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);

        // 4. Top 5 Categories & Merchants for Tables
        const totalExpSum = byCategoryRaw.reduce((acc, c) => acc + Number(c.amount), 0);
        const top5Categories = byCategoryRaw.slice(0, 5).map(c => ({
            ...c,
            percentage: totalExpSum > 0 ? Math.round((Number(c.amount) / totalExpSum) * 100) : 0
        }));

        const byMerchantRaw = await db.select({
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
            .groupBy(schema.transactions.merchantId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        const top5Merchants = byMerchantRaw.slice(0, 5).map(m => ({
            ...m,
            percentage: totalExpSum > 0 ? Math.round((Number(m.amount) / totalExpSum) * 100) : 0
        }));

        // 5. Top 5 Debts by outstanding amount
        const top5Debts = [...debts]
            .sort((a, b) => Number(b.outstandingAmount) - Number(a.outstandingAmount))
            .slice(0, 5)
            .map(d => ({
                id: d.id,
                entity: d.person?.name || 'Unknown',
                kind: d.kind,
                outstandingAmount: Number(d.outstandingAmount)
            }));

        return {
            summary: {
                totalIncome,
                totalExpense,
                netCashflow: totalIncome - totalExpense,
                topCategory: {
                    name: topCategoryData.name,
                    amount: topCategoryData.amount
                },
                debts: {
                    payable: totalDebtPayable,
                    receivable: totalDebtReceivable
                }
            },
            tables: {
                topCategories: top5Categories,
                topMerchants: top5Merchants,
                topDebts: top5Debts
            }
        };
    }
}
