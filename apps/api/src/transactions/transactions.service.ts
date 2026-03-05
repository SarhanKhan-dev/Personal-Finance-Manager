import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, sql, and, between, desc } from 'drizzle-orm';
import { CreateTransactionRequest } from '@finance/shared';

@Injectable()
export class TransactionsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string, from?: string, to?: string, page: number = 1, limit: number = 20) {
        const db = this.dbService.db;
        const offset = (page - 1) * limit;

        let dateFilter = undefined;
        if (from && to) {
            dateFilter = between(schema.transactions.occurredAt, from, to);
        }

        const whereClause = dateFilter ? and(eq(schema.transactions.userId, userId), dateFilter) : eq(schema.transactions.userId, userId);

        const transactions = await db.query.transactions.findMany({
            where: whereClause,
            orderBy: [desc(schema.transactions.occurredAt)],
            limit,
            offset,
            with: {
                asset: true,
                category: true,
                merchant: true,
            }
        });

        // Add Mock person info for debt transactions (can be expanded to relations later)
        const enrichedTransactions = await Promise.all(transactions.map(async t => {
            if (t.type === 'LOAN_GIVEN' || t.type === 'LOAN_RECEIVED') {
                const entry = await db.query.ledgerEntries.findFirst({
                    where: and(eq(schema.ledgerEntries.transactionId, t.id), eq(schema.ledgerEntries.entityType, 'DEBT'))
                });
                if (entry) {
                    const debt = await db.query.debts.findFirst({
                        where: eq(schema.debts.id, entry.entityId),
                        with: { person: true }
                    });
                    return { ...t, person: debt?.person };
                }
            }
            return t;
        }));

        const totalResult = await db.select({ count: sql<number>`count(*)` }).from(schema.transactions).where(whereClause);
        const count = totalResult[0].count;

        const allInRange = await db.query.transactions.findMany({ where: whereClause });
        const summary = {
            totalVolume: allInRange.reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
            outflow: allInRange.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
            inflow: allInRange.filter((t: any) => t.type === 'INCOME').reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
        };

        return { transactions: enrichedTransactions, summary, count };
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.transactions.findFirst({
            where: and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)),
            with: {
                asset: true,
                category: true,
                merchant: true,
                splits: { with: { source: true } }
            }
        });
    }

    async create(userId: string, req: CreateTransactionRequest) {
        return await this.dbService.runTransaction(async (tx) => {
            // Check dynamic entity creation
            if (req.personName && !req.personId) {
                let person = await tx.query.people.findFirst({ where: and(eq(schema.people.userId, userId), eq(schema.people.name, req.personName)) });
                if (!person) {
                    const [newPerson] = await tx.insert(schema.people).values({ userId, name: req.personName }).returning();
                    person = newPerson;
                }
                req.personId = person.id;
            }

            if (req.sourceName && (!req.splits || req.splits.length === 0)) {
                let source = await tx.query.sources.findFirst({ where: and(eq(schema.sources.userId, userId), eq(schema.sources.name, req.sourceName)) });
                if (!source) {
                    const [newSource] = await tx.insert(schema.sources).values({ userId, name: req.sourceName, allowNegative: true, type: 'OWNED' }).returning();
                    source = newSource;
                }
                req.splits = [{ sourceId: source.id, amount: req.totalAmount }];
            }

            if (req.categoryName && !req.categoryId) {
                let category = await tx.query.categories.findFirst({ where: and(eq(schema.categories.userId, userId), eq(schema.categories.name, req.categoryName)) });
                if (!category) {
                    const [newCategory] = await tx.insert(schema.categories).values({ userId, name: req.categoryName }).returning();
                    category = newCategory;
                }
                req.categoryId = category.id;
            }

            if (req.merchantName && !req.merchantId) {
                let merchant = await tx.query.merchants.findFirst({ where: and(eq(schema.merchants.userId, userId), eq(schema.merchants.name, req.merchantName)) });
                if (!merchant) {
                    const [newMerchant] = await tx.insert(schema.merchants).values({ userId, name: req.merchantName }).returning();
                    merchant = newMerchant;
                }
                req.merchantId = merchant.id;
            }

            const [transaction] = await tx.insert(schema.transactions).values({
                userId,
                type: req.type,
                totalAmount: req.totalAmount,
                occurredAt: req.occurredAt || new Date().toISOString(),
                description: req.description,
                merchantId: req.merchantId,
                categoryId: req.categoryId,
                assetId: req.assetId,
            }).returning();

            if (req.lineItems && req.lineItems.length > 0) {
                for (const item of req.lineItems) {
                    await tx.insert(schema.transactionLines).values({
                        transactionId: transaction.id,
                        label: item.label,
                        amount: item.amount,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    });
                }
            }

            switch (req.type) {
                case 'EXPENSE': await this.handleExpense(tx, userId, transaction.id, req); break;
                case 'INCOME': await this.handleIncome(tx, userId, transaction.id, req); break;
                case 'LOAN_GIVEN': await this.handleLoanGiven(tx, userId, transaction.id, req); break;
                case 'LOAN_RECEIVED': await this.handleLoanReceived(tx, userId, transaction.id, req); break;
                default: throw new BadRequestException(`Transaction type ${req.type} not yet implemented`);
            }

            return transaction;
        });
    }

    async remove(userId: string, id: string) {
        return await this.dbService.runTransaction(async (tx) => {
            const transaction = await tx.query.transactions.findFirst({
                where: and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)),
            });

            if (!transaction) throw new BadRequestException('Transaction not found');

            const entries = await tx.query.ledgerEntries.findMany({
                where: eq(schema.ledgerEntries.transactionId, id),
            });

            for (const entry of entries) {
                const amount = entry.amount;
                const operator = entry.direction === 'DEBIT' ? '+' : '-';

                if (entry.entityType === 'ASSET') {
                    await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} ${sql.raw(operator)} ${amount}` }).where(eq(schema.assets.id, entry.entityId));
                } else if (entry.entityType === 'SOURCE') {
                    await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} ${sql.raw(operator)} ${amount}` }).where(eq(schema.sources.id, entry.entityId));
                } else if (entry.entityType === 'DEBT') {
                    await tx.update(schema.debts).set({ outstandingAmount: sql`${schema.debts.outstandingAmount} ${sql.raw(operator)} ${amount}` }).where(eq(schema.debts.id, entry.entityId));
                }
            }

            await tx.delete(schema.ledgerEntries).where(eq(schema.ledgerEntries.transactionId, id));
            await tx.delete(schema.transactionSplits).where(eq(schema.transactionSplits.transactionId, id));
            await tx.delete(schema.transactionLines).where(eq(schema.transactionLines.transactionId, id));

            return await tx.delete(schema.transactions).where(eq(schema.transactions.id, id)).returning();
        });
    }

    private async handleExpense(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits!;

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount });

        for (const split of splits) {
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'DEBIT', amount: split.amount });
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount });
        }
    }

    private async handleIncome(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits!;

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'CREDIT', amount: totalAmount });

        for (const split of splits) {
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'CREDIT', amount: split.amount });
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount });
        }
    }

    private async handleLoanGiven(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;

        // Outgoing money from an asset
        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount });

        // Upsert Debt
        let debtId = req.debtId;
        if (!debtId && req.personId) {
            const [newDebt] = await tx.insert(schema.debts).values({
                userId,
                personId: req.personId,
                kind: 'RECEIVABLE',
                principalAmount: 0,
                outstandingAmount: 0,
            }).returning();
            debtId = newDebt.id;
        }

        if (debtId) {
            await tx.update(schema.debts).set({ outstandingAmount: sql`${schema.debts.outstandingAmount} + ${totalAmount}` }).where(eq(schema.debts.id, debtId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'DEBT', entityId: debtId, direction: 'CREDIT', amount: totalAmount });
        }
    }

    private async handleLoanReceived(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;

        // Incoming money to an asset
        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'CREDIT', amount: totalAmount });

        // Upsert Debt
        let debtId = req.debtId;
        if (!debtId && req.personId) {
            const [newDebt] = await tx.insert(schema.debts).values({
                userId,
                personId: req.personId,
                kind: 'PAYABLE',
                principalAmount: 0,
                outstandingAmount: 0,
            }).returning();
            debtId = newDebt.id;
        }

        if (debtId) {
            await tx.update(schema.debts).set({ outstandingAmount: sql`${schema.debts.outstandingAmount} + ${totalAmount}` }).where(eq(schema.debts.id, debtId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'DEBT', entityId: debtId, direction: 'CREDIT', amount: totalAmount });
        }
    }
}
