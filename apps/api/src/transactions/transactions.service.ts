import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, sql, and } from 'drizzle-orm';
import { CreateTransactionRequest } from '@finance/shared';

@Injectable()
export class TransactionsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        return await this.dbService.db.query.transactions.findMany({
            where: eq(schema.transactions.userId, userId),
            orderBy: (transactions, { desc }) => [desc(transactions.occurredAt)],
            with: {
                asset: true,
                category: true,
                merchant: true,
            }
        });
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.transactions.findFirst({
            where: and(eq(schema.transactions.userId, userId), eq(schema.transactions.id, id)),
            with: {
                asset: true,
                category: true,
                merchant: true,
                splits: {
                    with: {
                        source: true
                    }
                }
            }
        });
    }

    async create(userId: string, req: CreateTransactionRequest) {
        return await this.dbService.runTransaction(async (tx) => {
            // 1. Create the main transaction record
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

            // 2. Handle specific transaction logic
            switch (req.type) {
                case 'EXPENSE':
                    await this.handleExpense(tx, userId, transaction.id, req);
                    break;
                case 'INCOME':
                    await this.handleIncome(tx, userId, transaction.id, req);
                    break;
                case 'TRANSFER_ASSET':
                    await this.handleTransferAsset(tx, userId, transaction.id, req);
                    break;
                case 'TRANSFER_SOURCE':
                    await this.handleTransferSource(tx, userId, transaction.id, req);
                    break;
                default:
                    throw new BadRequestException(`Transaction type ${req.type} not yet implemented`);
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

            // Find all ledger entries to reverse them
            const entries = await tx.query.ledgerEntries.findMany({
                where: eq(schema.ledgerEntries.transactionId, id),
            });

            for (const entry of entries) {
                const amount = entry.amount;
                const operator = entry.direction === 'DEBIT' ? '+' : '-';

                if (entry.entityType === 'ASSET') {
                    await tx.update(schema.assets)
                        .set({ balance: sql`${schema.assets.balance} ${sql.raw(operator)} ${amount}` })
                        .where(eq(schema.assets.id, entry.entityId));
                } else if (entry.entityType === 'SOURCE') {
                    await tx.update(schema.sources)
                        .set({ balance: sql`${schema.sources.balance} ${sql.raw(operator)} ${amount}` })
                        .where(eq(schema.sources.id, entry.entityId));
                }
            }

            // Delete related records
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

        const asset = await tx.query.assets.findFirst({ where: eq(schema.assets.id, assetId) });
        if (!asset || (!asset.allowNegative && asset.balance < totalAmount)) {
            throw new BadRequestException(`Insufficient funds in asset: ${asset?.name || 'Unknown'}`);
        }

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${totalAmount}` }).where(eq(schema.assets.id, assetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: assetId, direction: 'DEBIT', amount: totalAmount });

        for (const split of splits) {
            const source = await tx.query.sources.findFirst({ where: eq(schema.sources.id, split.sourceId) });
            if (!source || (!source.allowNegative && source.balance < split.amount)) {
                throw new BadRequestException(`Insufficient funds in source: ${source?.name || 'Unknown'}`);
            }
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

    private async handleTransferAsset(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const fromAssetId = req.assetId!;
        const toAssetId = req.toAssetId!;
        const amount = req.totalAmount;

        const fromAsset = await tx.query.assets.findFirst({ where: eq(schema.assets.id, fromAssetId) });
        if (!fromAsset || (!fromAsset.allowNegative && fromAsset.balance < amount)) {
            throw new BadRequestException(`Insufficient funds in asset: ${fromAsset?.name || 'Unknown'}`);
        }

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} - ${amount}` }).where(eq(schema.assets.id, fromAssetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: fromAssetId, direction: 'DEBIT', amount });

        await tx.update(schema.assets).set({ balance: sql`${schema.assets.balance} + ${amount}` }).where(eq(schema.assets.id, toAssetId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'ASSET', entityId: toAssetId, direction: 'CREDIT', amount });
    }

    private async handleTransferSource(tx: any, userId: string, txId: string, req: CreateTransactionRequest) {
        const fromSourceId = req.fromSourceId!;
        const toSourceId = req.toSourceId!;
        const amount = req.totalAmount;

        const fromSource = await tx.query.sources.findFirst({ where: eq(schema.sources.id, fromSourceId) });
        if (!fromSource || (!fromSource.allowNegative && fromSource.balance < amount)) {
            throw new BadRequestException(`Insufficient funds in source: ${fromSource?.name || 'Unknown'}`);
        }

        await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} - ${amount}` }).where(eq(schema.sources.id, fromSourceId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: fromSourceId, direction: 'DEBIT', amount });

        await tx.update(schema.sources).set({ balance: sql`${schema.sources.balance} + ${amount}` }).where(eq(schema.sources.id, toSourceId));
        await tx.insert(schema.ledgerEntries).values({ userId, transactionId: txId, entityType: 'SOURCE', entityId: toSourceId, direction: 'CREDIT', amount });
    }
}
