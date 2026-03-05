import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, and, between, sql, desc } from 'drizzle-orm';

@Injectable()
export class ReportsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getDashboardData(userId: string, from: string, to: string) {
        const db = this.dbService.db;

        const transactionsInRange = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.userId, userId),
                eq(schema.transactions.status, 'POSTED'),
                between(schema.transactions.occurredAt, from, to)
            )
        });

        const incomeTxs = transactionsInRange.filter(t => t.type === 'INCOME');
        const expenseTxs = transactionsInRange.filter(t => t.type === 'EXPENSE');
        const totalIncome = incomeTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);
        const totalExpense = expenseTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

        // Top Category
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
                eq(schema.transactions.status, 'POSTED'),
                between(schema.transactions.occurredAt, from, to)
            ))
            .groupBy(schema.transactions.categoryId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        const topCategoryData = byCategoryRaw[0] || { name: 'None', amount: 0 };

        // Assets total balance (current, not date-range)
        const allAssets = await db.query.assets.findMany({ where: eq(schema.assets.userId, userId) });
        const totalAssetBalance = allAssets.reduce((a, asset) => a + Number(asset.balance), 0);

        // Debts
        const debts = await db.query.debts.findMany({
            where: eq(schema.debts.userId, userId),
            with: { person: true }
        });
        const totalDebtPayable = debts.filter(d => d.kind === 'PAYABLE').reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);
        const totalDebtReceivable = debts.filter(d => d.kind === 'RECEIVABLE').reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);

        // Top 5 Categories
        const totalExpSum = byCategoryRaw.reduce((acc, c) => acc + Number(c.amount), 0);
        const top5Categories = byCategoryRaw.slice(0, 5).map(c => ({
            ...c,
            percentage: totalExpSum > 0 ? Math.round((Number(c.amount) / totalExpSum) * 100) : 0
        }));

        // Top 5 Merchants
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
                eq(schema.transactions.status, 'POSTED'),
                between(schema.transactions.occurredAt, from, to)
            ))
            .groupBy(schema.transactions.merchantId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        const top5Merchants = byMerchantRaw.slice(0, 5).map(m => ({
            ...m,
            percentage: totalExpSum > 0 ? Math.round((Number(m.amount) / totalExpSum) * 100) : 0
        }));

        // Top 5 Debts
        const top5Debts = [...debts]
            .sort((a, b) => Number(b.outstandingAmount) - Number(a.outstandingAmount))
            .slice(0, 5)
            .map(d => ({
                id: d.id,
                entity: (d as any).person?.name || 'Unknown',
                kind: d.kind,
                outstandingAmount: Number(d.outstandingAmount)
            }));

        return {
            summary: {
                totalIncome,
                totalExpense,
                totalAssetBalance,
                netCashflow: totalIncome - totalExpense,
                topCategory: { name: topCategoryData.name, amount: topCategoryData.amount },
                debts: { payable: totalDebtPayable, receivable: totalDebtReceivable }
            },
            tables: { topCategories: top5Categories, topMerchants: top5Merchants, topDebts: top5Debts }
        };
    }

    async getRange(userId: string, from: string, to: string) {
        const db = this.dbService.db;
        const txs = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.userId, userId),
                eq(schema.transactions.status, 'POSTED'),
                between(schema.transactions.occurredAt, from, to)
            ),
            with: { category: true, merchant: true, asset: true }
        });

        const income = txs.filter(t => t.type === 'INCOME').reduce((a, t) => a + Number(t.totalAmount), 0);
        const expense = txs.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + Number(t.totalAmount), 0);

        const byCategory = await db.select({
            categoryId: schema.transactions.categoryId,
            categoryName: schema.categories.name,
            amount: sql<number>`sum(${schema.transactions.totalAmount})`
        }).from(schema.transactions)
            .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
            .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, 'EXPENSE'), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, from, to)))
            .groupBy(schema.transactions.categoryId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        const byMerchant = await db.select({
            merchantId: schema.transactions.merchantId,
            merchantName: schema.merchants.name,
            amount: sql<number>`sum(${schema.transactions.totalAmount})`
        }).from(schema.transactions)
            .leftJoin(schema.merchants, eq(schema.transactions.merchantId, schema.merchants.id))
            .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, 'EXPENSE'), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, from, to)))
            .groupBy(schema.transactions.merchantId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        // by Asset
        const byAsset = await db.select({
            assetId: schema.transactions.assetId,
            assetName: schema.assets.name,
            amount: sql<number>`sum(${schema.transactions.totalAmount})`
        }).from(schema.transactions)
            .leftJoin(schema.assets, eq(schema.transactions.assetId, schema.assets.id))
            .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, from, to)))
            .groupBy(schema.transactions.assetId)
            .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

        // Debt movements in range
        const debtTxs = txs.filter(t => ['LOAN_GIVEN', 'LOAN_RECEIVED', 'DEBT_PAYMENT'].includes(t.type));
        const debts = await db.query.debts.findMany({ where: eq(schema.debts.userId, userId) });

        return {
            from, to,
            totals: { income, expense, net: income - expense },
            byCategory,
            byMerchant,
            byAsset,
            byOwner: [],
            debts: {
                receivableCreated: debtTxs.filter(t => t.type === 'LOAN_GIVEN').reduce((a, t) => a + Number(t.totalAmount), 0),
                payableCreated: debtTxs.filter(t => t.type === 'LOAN_RECEIVED').reduce((a, t) => a + Number(t.totalAmount), 0),
                receivedPayments: 0,
                paidPayments: 0,
                outstandingReceivable: debts.filter(d => d.kind === 'RECEIVABLE').reduce((a, d) => a + Number(d.outstandingAmount), 0),
                outstandingPayable: debts.filter(d => d.kind === 'PAYABLE').reduce((a, d) => a + Number(d.outstandingAmount), 0),
            },
            topTransactions: txs.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).slice(0, 10),
        };
    }
}
