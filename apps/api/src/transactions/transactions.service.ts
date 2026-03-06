import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, sql, and, between, desc, or } from 'drizzle-orm';
import { CreateTransactionRequest } from '@finance/shared';

@Injectable()
export class TransactionsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string, opts: {
        from?: string; to?: string; page?: number; limit?: number;
        type?: string; categoryId?: string; merchantId?: string;
        ownerId?: string; assetId?: string; personId?: string;
    } = {}) {
        const db = this.dbService.db;
        const { from, to, page = 1, limit = 20, type, categoryId, merchantId, ownerId, assetId, personId } = opts;
        const offset = (page - 1) * limit;

        const conditions: any[] = [
            eq(schema.transactions.userId, userId),
            eq(schema.transactions.status, 'POSTED'),
        ];
        if (from && to) conditions.push(between(schema.transactions.occurredAt, from, to));
        if (type) conditions.push(eq(schema.transactions.type, type));
        if (categoryId) conditions.push(eq(schema.transactions.categoryId, categoryId));
        if (merchantId) conditions.push(eq(schema.transactions.merchantId, merchantId));
        if (assetId) conditions.push(or(eq(schema.transactions.assetId, assetId), eq(schema.transactions.fromAssetId, assetId), eq(schema.transactions.toAssetId, assetId)));
        if (personId) conditions.push(eq(schema.transactions.personId, personId));

        const whereClause = and(...conditions);

        const transactions = await db.query.transactions.findMany({
            where: whereClause,
            orderBy: [desc(schema.transactions.occurredAt)],
            limit,
            offset,
            with: {
                asset: true,
                category: true,
                merchant: true,
                person: true,
            }
        });

        // Add source splits for each transaction
        const enrichedTransactions = await Promise.all(transactions.map(async (t: any) => {
            const splits = await db.query.transactionSplits.findMany({
                where: eq(schema.transactionSplits.transactionId, t.id),
                with: { source: true }
            });
            const lineItems = await db.query.transactionLines.findMany({
                where: eq(schema.transactionLines.transactionId, t.id),
            });
            return { ...t, splits, lineItems };
        }));

        const totalResult = await db.select({ count: sql<string | number>`count(*)` }).from(schema.transactions).where(whereClause);
        const count = Number(totalResult[0]?.count) || 0;

        console.log(`[TransactionsService] Found ${count} total transactions in range`);

        // Summary (all in range, not paginated) - optimized to not fetch full objects
        const summaryRaw = await db.select({
            type: schema.transactions.type,
            amount: schema.transactions.totalAmount
        }).from(schema.transactions).where(whereClause);

        const summary = {
            totalVolume: summaryRaw.reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
            outflow: summaryRaw.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
            inflow: summaryRaw.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + (Number(t.amount) || 0), 0),
        };

        const finalResult = JSON.parse(JSON.stringify({
            transactions: enrichedTransactions,
            summary,
            count
        }));

        console.log('[TransactionsService] Successfully processed findAll');
        return finalResult;
    }

    async findOne(userId: string, id: string) {
        const t = await this.dbService.db.query.transactions.findFirst({
            where: and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)),
            with: {
                asset: true,
                category: true,
                merchant: true,
                person: true,
            }
        });
        if (!t) return null;
        const splits = await this.dbService.db.query.transactionSplits.findMany({
            where: eq(schema.transactionSplits.transactionId, id),
            with: { source: true }
        });
        const lineItems = await this.dbService.db.query.transactionLines.findMany({
            where: eq(schema.transactionLines.transactionId, id),
        });
        return JSON.parse(JSON.stringify({ ...t, splits, lineItems }));
    }

    async create(userId: string, req: CreateTransactionRequest) {
        return await this.dbService.runTransaction(async (tx) => {
            // --- Inline entity creation ---
            if (req.personName && !req.personId) {
                let person = await tx.query.people.findFirst({ where: and(eq(schema.people.userId, userId), eq(schema.people.name, req.personName)) });
                if (!person) {
                    const [newPerson] = await tx.insert(schema.people).values({ userId, name: req.personName } as any).returning();
                    person = newPerson;
                }
                req.personId = person.id;
            }

            if (req.sourceName && (!req.splits || req.splits.length === 0)) {
                let source = await tx.query.sources.findFirst({ where: and(eq(schema.sources.userId, userId), eq(schema.sources.name, req.sourceName)) });
                if (!source) {
                    const [newSource] = await tx.insert(schema.sources).values({ userId, name: req.sourceName, allowNegative: true, type: 'OWNED' } as any).returning();
                    source = newSource;
                }
                req.splits = [{ sourceId: source.id, amount: req.totalAmount }];
            }

            if (req.categoryName && !req.categoryId) {
                let category = await tx.query.categories.findFirst({ where: and(eq(schema.categories.userId, userId), eq(schema.categories.name, req.categoryName)) });
                if (!category) {
                    const [newCategory] = await tx.insert(schema.categories).values({ userId, name: req.categoryName } as any).returning();
                    category = newCategory;
                }
                req.categoryId = category.id;
            }

            if (req.merchantName && !req.merchantId) {
                let merchant = await tx.query.merchants.findFirst({ where: and(eq(schema.merchants.userId, userId), eq(schema.merchants.name, req.merchantName)) });
                if (!merchant) {
                    const [newMerchant] = await tx.insert(schema.merchants).values({ userId, name: req.merchantName } as any).returning();
                    merchant = newMerchant;
                }
                req.merchantId = merchant.id;
            }

            // --- Validation ---
            if (['EXPENSE', 'INCOME'].includes(req.type) && req.lineItems && req.lineItems.length > 0) {
                const itemSum = req.lineItems.reduce((a, i) => a + i.amount, 0);
                if (itemSum !== req.totalAmount) {
                    throw new BadRequestException(`Line items sum (${itemSum}) must equal totalAmount (${req.totalAmount})`);
                }
            }
            if (['EXPENSE', 'INCOME', 'LOAN_GIVEN', 'LOAN_RECEIVED'].includes(req.type) && req.splits && req.splits.length > 0) {
                const splitSum = req.splits.reduce((a, s) => a + s.amount, 0);
                if (splitSum !== req.totalAmount) {
                    throw new BadRequestException(`Owner splits sum (${splitSum}) must equal totalAmount (${req.totalAmount})`);
                }
            }

            // --- Insert transaction header ---
            const [transaction] = await tx.insert(schema.transactions).values({
                userId,
                type: req.type,
                totalAmount: req.totalAmount,
                occurredAt: req.occurredAt || new Date().toISOString(),
                description: req.description,
                merchantId: req.merchantId,
                categoryId: req.categoryId,
                assetId: req.assetId,
                personId: req.personId,
                fromAssetId: req.fromAssetId,
                toAssetId: req.toAssetId,
                fromOwnerId: req.fromOwnerId,
                toOwnerId: req.toOwnerId,
            } as any).returning();

            // --- Insert line items ---
            if (req.lineItems && req.lineItems.length > 0) {
                for (const item of req.lineItems) {
                    await tx.insert(schema.transactionLines).values({
                        transactionId: transaction.id,
                        label: item.label,
                        amount: item.amount,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice
                    } as any);
                }
            }

            // --- Route to handler ---
            switch (req.type) {
                case 'EXPENSE': await this.handleExpense(tx, userId, transaction.id, req); break;
                case 'INCOME': await this.handleIncome(tx, userId, transaction.id, req); break;
                case 'ASSET_TRANSFER': await this.handleAssetTransfer(tx, userId, transaction.id, req); break;
                case 'OWNERSHIP_TRANSFER': await this.handleOwnershipTransfer(tx, userId, transaction.id, req); break;
                case 'LOAN_GIVEN': await this.handleLoanGiven(tx, userId, transaction.id, req); break;
                case 'LOAN_RECEIVED': await this.handleLoanReceived(tx, userId, transaction.id, req); break;
                case 'DEBT_PAYMENT': await this.handleDebtPayment(tx, userId, transaction.id, req); break;
                default: throw new BadRequestException(`Transaction type ${req.type} not implemented`);
            }

            return transaction;
        });
    }

    async void(userId: string, id: string) {
        return await this.dbService.runTransaction(async (tx) => {
            const transaction = await tx.query.transactions.findFirst({
                where: and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)),
            });
            if (!transaction) throw new BadRequestException('Transaction not found');
            if (transaction.status === 'VOIDED') throw new BadRequestException('Transaction already voided');

            const entries = await tx.query.ledgerEntries.findMany({
                where: eq(schema.ledgerEntries.transactionId, id),
            });

            // Create reversing entries + reverse cached balances
            for (const entry of entries) {
                const amount = entry.amount;
                const reverseDir = entry.direction === 'DEBIT' ? 'CREDIT' : 'DEBIT';
                const operator = entry.direction === 'DEBIT' ? '+' : '-';

                if (entry.entityType === 'ASSET') {
                    await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} ${sql.raw(operator)} ${amount}` }).where(eq(schema.assets.id, entry.entityId));
                } else if (entry.entityType === 'SOURCE') {
                    await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} ${sql.raw(operator)} ${amount}` }).where(eq(schema.sources.id, entry.entityId));
                } else if (entry.entityType === 'DEBT') {
                    await tx.update(schema.debts).set({ outstandingAmount: sql`${schema.debts.outstandingAmount} ${sql.raw(operator)} ${amount}` }).where(eq(schema.debts.id, entry.entityId));
                }

                // Write reversing ledger entry for audit trail
                await tx.insert(schema.ledgerEntries).values({
                    userId,
                    transactionId: id,
                    entityType: entry.entityType,
                    entityId: entry.entityId,
                    direction: reverseDir,
                    amount,
                } as any);
            }

            await tx.update(schema.transactions).set({ status: 'VOIDED' }).where(eq(schema.transactions.id, id));
            return { success: true, message: 'Transaction voided' };
        });
    }

    async remove(userId: string, id: string) {
        // Alias void for compatibility
        return this.void(userId, id);
    }

    // --- Private Handlers ---

    private async handleExpense(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits!;

        // Check balances
        const asset = await tx.query.assets.findFirst({ where: eq(schema.assets.id, assetId) });
        if (asset && !asset.allowNegative && (asset.balance - totalAmount) < 0) {
            throw new BadRequestException(`Insufficient balance in asset "${asset.name}". Available: ${asset.balance}`);
        }

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount } as any);

        for (const split of splits) {
            const source = await tx.query.sources.findFirst({ where: eq(schema.sources.id, split.sourceId) });
            if (source && !source.allowNegative && (source.balance - split.amount) < 0) {
                throw new BadRequestException(`Insufficient balance in owner "${source.name}". Available: ${source.balance}`);
            }
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'DEBIT', amount: split.amount } as any);
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
        }
    }

    private async handleIncome(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits!;

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'CREDIT', amount: totalAmount } as any);

        for (const split of splits) {
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'CREDIT', amount: split.amount } as any);
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
        }
    }

    private async handleAssetTransfer(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const amount = req.totalAmount;
        const fromAssetId = req.fromAssetId!;
        const toAssetId = req.toAssetId!;

        const fromAsset = await tx.query.assets.findFirst({ where: eq(schema.assets.id, fromAssetId) });
        if (fromAsset && !fromAsset.allowNegative && (fromAsset.balance - amount) < 0) {
            throw new BadRequestException(`Insufficient balance in asset "${fromAsset.name}". Available: ${fromAsset.balance}`);
        }

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${amount}` }).where(eq(schema.assets.id, fromAssetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: fromAssetId, direction: 'DEBIT', amount } as any);

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${amount}` }).where(eq(schema.assets.id, toAssetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: toAssetId, direction: 'CREDIT', amount } as any);
    }

    private async handleOwnershipTransfer(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const amount = req.totalAmount;
        const fromOwnerId = req.fromOwnerId!;
        const toOwnerId = req.toOwnerId!;

        const fromOwner = await tx.query.sources.findFirst({ where: eq(schema.sources.id, fromOwnerId) });
        if (fromOwner && !fromOwner.allowNegative && (fromOwner.balance - amount) < 0) {
            throw new BadRequestException(`Insufficient balance in owner "${fromOwner.name}". Available: ${fromOwner.balance}`);
        }

        await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${amount}` }).where(eq(schema.sources.id, fromOwnerId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: fromOwnerId, direction: 'DEBIT', amount } as any);

        await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${amount}` }).where(eq(schema.sources.id, toOwnerId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: toOwnerId, direction: 'CREDIT', amount } as any);
    }

    private async handleLoanGiven(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits || [];

        // Decrease asset
        const asset = await tx.query.assets.findFirst({ where: eq(schema.assets.id, assetId) });
        if (asset && !asset.allowNegative && (asset.balance - totalAmount) < 0) {
            throw new BadRequestException(`Insufficient balance in asset "${asset.name}". Available: ${asset.balance}`);
        }
        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount } as any);

        // Decrease owner splits
        for (const split of splits) {
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'DEBIT', amount: split.amount } as any);
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
        }

        // Create/update debt receivable
        if (req.personId) {
            let existingDebt = await tx.query.debts.findFirst({
                where: and(eq(schema.debts.userId, userId), eq(schema.debts.personId, req.personId), eq(schema.debts.kind, 'RECEIVABLE'), eq(schema.debts.status, 'OPEN'))
            });
            if (!existingDebt) {
                const [newDebt] = await tx.insert(schema.debts).values({
                    userId, personId: req.personId, kind: 'RECEIVABLE', principalAmount: 0, outstandingAmount: 0
                } as any).returning();
                existingDebt = newDebt;
            }
            await tx.update(schema.debts).set({
                outstandingAmount: sql`${schema.debts.outstandingAmount} + ${totalAmount}`,
                principalAmount: sql`${schema.debts.principalAmount} + ${totalAmount}`,
            }).where(eq(schema.debts.id, existingDebt.id));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'DEBT', entityId: existingDebt.id, direction: 'CREDIT', amount: totalAmount } as any);
        }
    }

    private async handleLoanReceived(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits || [];

        // Increase asset
        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'CREDIT', amount: totalAmount } as any);

        // Increase owner splits
        for (const split of splits) {
            await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'CREDIT', amount: split.amount } as any);
            await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
        }

        // Create/update debt payable
        if (req.personId) {
            let existingDebt = await tx.query.debts.findFirst({
                where: and(eq(schema.debts.userId, userId), eq(schema.debts.personId, req.personId), eq(schema.debts.kind, 'PAYABLE'), eq(schema.debts.status, 'OPEN'))
            });
            if (!existingDebt) {
                const [newDebt] = await tx.insert(schema.debts).values({
                    userId, personId: req.personId, kind: 'PAYABLE', principalAmount: 0, outstandingAmount: 0
                } as any).returning();
                existingDebt = newDebt;
            }
            await tx.update(schema.debts).set({
                outstandingAmount: sql`${schema.debts.outstandingAmount} + ${totalAmount}`,
                principalAmount: sql`${schema.debts.principalAmount} + ${totalAmount}`,
            }).where(eq(schema.debts.id, existingDebt.id));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'DEBT', entityId: existingDebt.id, direction: 'DEBIT', amount: totalAmount } as any);
        }
    }

    private async handleDebtPayment(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const totalAmount = req.totalAmount;
        const assetId = req.assetId!;
        const splits = req.splits || [];

        // direction: 'PAY' = paying back (payable), 'RECEIVE' = receiving back (receivable)
        const isPaying = req.direction === 'PAY';

        if (isPaying) {
            // Paying debt: asset decreases, owner decreases
            await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount } as any);
            for (const split of splits) {
                await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
                await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'DEBIT', amount: split.amount } as any);
                await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
            }
        } else {
            // Receiving debt: asset increases, owner increases
            await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${totalAmount}` }).where(eq(schema.assets.id, assetId));
            await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'CREDIT', amount: totalAmount } as any);
            for (const split of splits) {
                await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${split.amount}` }).where(eq(schema.sources.id, split.sourceId));
                await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: split.sourceId, direction: 'CREDIT', amount: split.amount } as any);
                await tx.insert(schema.transactionSplits).values({ transactionId: txId, sourceId: split.sourceId, amount: split.amount } as any);
            }
        }

        // Reduce the debt outstanding
        if (req.personId) {
            const kind = isPaying ? 'PAYABLE' : 'RECEIVABLE';
            const debt = await tx.query.debts.findFirst({
                where: and(eq(schema.debts.userId, userId), eq(schema.debts.personId, req.personId), eq(schema.debts.kind, kind), eq(schema.debts.status, 'OPEN'))
            });
            if (debt) {
                const newOutstanding = Math.max(0, Number(debt.outstandingAmount) - totalAmount);
                await tx.update(schema.debts).set({
                    outstandingAmount: newOutstanding,
                    status: newOutstanding === 0 ? 'CLOSED' : 'OPEN',
                }).where(eq(schema.debts.id, debt.id));
                await tx.insert(schema.ledgerEntries).values({
                    userId, transactionId: txId, entityType: 'DEBT', entityId: debt.id,
                    direction: isPaying ? 'DEBIT' : 'CREDIT', amount: totalAmount
                } as any);
            }
        }
    }
}
