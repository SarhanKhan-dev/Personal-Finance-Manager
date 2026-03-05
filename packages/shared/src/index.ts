import { z } from 'zod';

// Transaction Types
export const TransactionTypeEnum = z.enum([
    'EXPENSE',
    'INCOME',
    'ASSET_TRANSFER',
    'OWNERSHIP_TRANSFER',
    'LOAN_GIVEN',
    'LOAN_RECEIVED',
    'DEBT_PAYMENT',
]);

export type TransactionType = z.infer<typeof TransactionTypeEnum>;

// Core Schemas
export const CreateTransactionSchema = z.object({
    type: TransactionTypeEnum,
    totalAmount: z.number().int().positive(),
    occurredAt: z.string().optional().default(() => new Date().toISOString()),
    description: z.string().optional(),

    // For INCOME / EXPENSE / LOAN_GIVEN / LOAN_RECEIVED
    assetId: z.string().optional(),

    // For ASSET_TRANSFER
    fromAssetId: z.string().optional(),
    toAssetId: z.string().optional(),

    // For OWNERSHIP_TRANSFER
    fromOwnerId: z.string().optional(),
    toOwnerId: z.string().optional(),

    merchantId: z.string().optional(),
    merchantName: z.string().optional(),
    categoryId: z.string().optional(),
    categoryName: z.string().optional(),

    // Owner (source) splits for expense/income/loans
    splits: z.array(z.object({
        sourceId: z.string(),
        amount: z.number().int().positive()
    })).optional(),

    lineItems: z.array(z.object({
        label: z.string(),
        amount: z.number().int().positive(),
        quantity: z.number().int().positive().optional(),
        unitPrice: z.number().int().positive().optional()
    })).optional(),

    // Inline creation helpers
    sourceName: z.string().optional(),
    personId: z.string().optional(),
    personName: z.string().optional(),
    debtId: z.string().optional(),
    direction: z.enum(['RECEIVE', 'PAY']).optional()
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionSchema>;

// Report Response Schema
export const ReportResponseSchema = z.object({
    from: z.string(),
    to: z.string(),
    totals: z.object({
        income: z.number(),
        expense: z.number(),
        net: z.number()
    }),
    byCategory: z.array(z.object({ categoryId: z.string(), categoryName: z.string(), amount: z.number() })),
    byMerchant: z.array(z.object({ merchantId: z.string(), merchantName: z.string(), amount: z.number() })),
    byAsset: z.array(z.object({ assetId: z.string(), assetName: z.string(), amount: z.number() })),
    byOwner: z.array(z.object({ ownerId: z.string(), ownerName: z.string(), amount: z.number() })),
    debts: z.object({
        receivableCreated: z.number(),
        payableCreated: z.number(),
        receivedPayments: z.number(),
        paidPayments: z.number(),
        outstandingReceivable: z.number(),
        outstandingPayable: z.number()
    }),
    topTransactions: z.array(z.any())
});

export type ReportResponse = z.infer<typeof ReportResponseSchema>;
