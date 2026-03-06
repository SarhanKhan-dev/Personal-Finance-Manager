import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and, between, sql, desc } from 'drizzle-orm';

@Injectable()
export class ReportsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getDashboardData(userId: string, from: string, to: string) {
        const db = this.dbService.db;

        // Validation & Defaults
        const now = new Date();
        const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const defaultTo = now.toISOString();

        const startDate = from || defaultFrom;
        const endDate = to || defaultTo;

        try {
            const transactionsInRange = await db.query.transactions.findMany({
                where: and(
                    eq(schema.transactions.userId, userId),
                    eq(schema.transactions.status, 'POSTED'),
                    between(schema.transactions.occurredAt, startDate, endDate)
                )
            });

            const incomeTxs = transactionsInRange.filter(t => t.type === 'INCOME');
            const expenseTxs = transactionsInRange.filter(t => t.type === 'EXPENSE');
            const totalIncome = incomeTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);
            const totalExpense = expenseTxs.reduce((acc, t) => acc + (Number(t.totalAmount) || 0), 0);

            // Top Category - Expanded with error checking
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
                    between(schema.transactions.occurredAt, startDate, endDate)
                ))
                .groupBy(schema.transactions.categoryId, schema.categories.name)
                .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

            const topCategoryData = byCategoryRaw[0] || { name: 'None', amount: 0 };

            // Assets total balance (current, not date-range)
            const allAssets = await db.query.assets.findMany({ where: eq(schema.assets.userId, userId) });
            const totalAssetBalance = allAssets.reduce((a, asset) => a + Number(asset.balance || 0), 0);

            // Debts
            const debts = await db.query.debts.findMany({
                where: eq(schema.debts.userId, userId),
                with: { person: true }
            });
            const totalDebtPayable = debts.filter(d => d.kind === 'PAYABLE').reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);
            const totalDebtReceivable = debts.filter(d => d.kind === 'RECEIVABLE').reduce((acc, d) => acc + (Number(d.outstandingAmount) || 0), 0);

            // Top 5 Categories
            const totalExpSum = byCategoryRaw.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
            const top5Categories = byCategoryRaw.slice(0, 5).map(c => ({
                id: c.id,
                name: c.name || 'Uncategorized',
                amount: Number(c.amount) || 0,
                count: Number(c.count) || 0,
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
                    between(schema.transactions.occurredAt, startDate, endDate)
                ))
                .groupBy(schema.transactions.merchantId, schema.merchants.name)
                .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

            const top5Merchants = byMerchantRaw.slice(0, 5).map(m => ({
                id: m.id,
                name: m.name || 'Unknown Merchant',
                amount: Number(m.amount) || 0,
                count: Number(m.count) || 0,
                percentage: totalExpSum > 0 ? Math.round((Number(m.amount) / totalExpSum) * 100) : 0
            }));

            // Top 5 Debts
            const top5Debts = [...debts]
                .sort((a, b) => (Number(b.outstandingAmount) || 0) - (Number(a.outstandingAmount) || 0))
                .slice(0, 5)
                .map(d => ({
                    id: d.id,
                    entity: (d as any).person?.name || 'Unknown',
                    kind: d.kind,
                    outstandingAmount: Number(d.outstandingAmount) || 0
                }));

            const summary = {
                totalIncome,
                totalExpense,
                totalAssetBalance,
                netCashflow: totalIncome - totalExpense,
                topCategory: { name: topCategoryData.name || 'Uncategorized', amount: Number(topCategoryData.amount) || 0 },
                debts: { payable: totalDebtPayable, receivable: totalDebtReceivable }
            };

            const tables = {
                topCategories: top5Categories,
                topMerchants: top5Merchants,
                topDebts: top5Debts
            };

            const data = { summary, tables };

            // Critical: Ensure no BigInts or non-serializable objects remain
            console.log('[ReportsService] Successfully generated dashboard data');
            return JSON.parse(JSON.stringify(data));
        } catch (error) {
            console.error('[ReportsService] Error in getDashboardData:', error);
            throw error;
        }
    }

    async getRange(userId: string, from: string, to: string) {
        const db = this.dbService.db;

        // Validation & Defaults
        const now = new Date();
        const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const defaultTo = now.toISOString();

        const startDate = from || defaultFrom;
        const endDate = to || defaultTo;

        try {
            const txs = await db.query.transactions.findMany({
                where: and(
                    eq(schema.transactions.userId, userId),
                    eq(schema.transactions.status, 'POSTED'),
                    between(schema.transactions.occurredAt, startDate, endDate)
                ),
                with: { category: true, merchant: true, asset: true }
            });

            const income = txs.filter(t => t.type === 'INCOME').reduce((a, t) => a + (Number(t.totalAmount) || 0), 0);
            const expense = txs.filter(t => t.type === 'EXPENSE').reduce((a, t) => a + (Number(t.totalAmount) || 0), 0);

            const byCategory = await db.select({
                categoryId: schema.transactions.categoryId,
                categoryName: schema.categories.name,
                amount: sql<number>`sum(${schema.transactions.totalAmount})`
            }).from(schema.transactions)
                .leftJoin(schema.categories, eq(schema.transactions.categoryId, schema.categories.id))
                .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, 'EXPENSE'), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, startDate, endDate)))
                .groupBy(schema.transactions.categoryId, schema.categories.name)
                .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

            const byMerchant = await db.select({
                merchantId: schema.transactions.merchantId,
                merchantName: schema.merchants.name,
                amount: sql<number>`sum(${schema.transactions.totalAmount})`
            }).from(schema.transactions)
                .leftJoin(schema.merchants, eq(schema.transactions.merchantId, schema.merchants.id))
                .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.type, 'EXPENSE'), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, startDate, endDate)))
                .groupBy(schema.transactions.merchantId, schema.merchants.name)
                .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

            const byAsset = await db.select({
                assetId: schema.transactions.assetId,
                assetName: schema.assets.name,
                amount: sql<number>`sum(${schema.transactions.totalAmount})`
            }).from(schema.transactions)
                .leftJoin(schema.assets, eq(schema.transactions.assetId, schema.assets.id))
                .where(and(eq(schema.transactions.userId, userId), eq(schema.transactions.status, 'POSTED'), between(schema.transactions.occurredAt, startDate, endDate)))
                .groupBy(schema.transactions.assetId, schema.assets.name)
                .orderBy(desc(sql`sum(${schema.transactions.totalAmount})`));

            const debtTxs = txs.filter(t => ['LOAN_GIVEN', 'LOAN_RECEIVED', 'DEBT_PAYMENT'].includes(t.type));
            const debts = await db.query.debts.findMany({ where: eq(schema.debts.userId, userId) });

            const result = {
                from: startDate,
                to: endDate,
                totals: { income, expense, net: income - expense },
                byCategory: byCategory.map(c => ({ ...c, amount: Number(c.amount) || 0 })),
                byMerchant: byMerchant.map(m => ({ ...m, amount: Number(m.amount) || 0 })),
                byAsset: byAsset.map(a => ({ ...a, amount: Number(a.amount) || 0 })),
                byOwner: [],
                debts: {
                    receivableCreated: debtTxs.filter(t => t.type === 'LOAN_GIVEN').reduce((a, t) => a + (Number(t.totalAmount) || 0), 0),
                    payableCreated: debtTxs.filter(t => t.type === 'LOAN_RECEIVED').reduce((a, t) => a + (Number(t.totalAmount) || 0), 0),
                    receivedPayments: 0,
                    paidPayments: 0,
                    outstandingReceivable: debts.filter(d => d.kind === 'RECEIVABLE').reduce((a, d) => a + (Number(d.outstandingAmount) || 0), 0),
                    outstandingPayable: debts.filter(d => d.kind === 'PAYABLE').reduce((a, d) => a + (Number(d.outstandingAmount) || 0), 0),
                },
                topTransactions: txs.sort((a, b) => Number(b.totalAmount) - Number(a.totalAmount)).slice(0, 10).map(t => ({
                    id: t.id,
                    type: t.type,
                    totalAmount: Number(t.totalAmount),
                    occurredAt: t.occurredAt,
                    description: t.description,
                    category: (t as any).category?.name,
                    merchant: (t as any).merchant?.name,
                    asset: (t as any).asset?.name,
                })),
            };

            return JSON.parse(JSON.stringify(result));
        } catch (error) {
            console.error('[ReportsService] Error in getRange:', error);
            throw error;
        }
    }
}
