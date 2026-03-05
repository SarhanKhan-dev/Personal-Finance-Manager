import { z } from 'zod';

// Transaction Types
export const TransactionTypeEnum = z.enum([
    'EXPENSE',
    'INCOME',
    'TRANSFER_ASSET',
    'TRANSFER_SOURCE',
    'LOAN_GIVEN',
    'LOAN_RECEIVED',
    'DEBT_PAYMENT',
    'ADJUSTMENT'
]);

export type TransactionType = z.infer<typeof TransactionTypeEnum>;

// Core Schemas
export const CreateTransactionSchema = z.object({
    type: TransactionTypeEnum,
    totalAmount: z.number().int().positive(),
    occurredAt: z.string().datetime().optional().default(() => new Date().toISOString()),
    description: z.string().optional(),

    assetId: z.string().uuid().optional(),
    toAssetId: z.string().uuid().optional(),

    merchantId: z.string().uuid().optional(),
    merchantName: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    categoryName: z.string().optional(),

    splits: z.array(z.object({
        sourceId: z.string().uuid(),
        amount: z.number().int().positive()
    })).optional(),

    fromSourceId: z.string().uuid().optional(),
    toSourceId: z.string().uuid().optional(),

    lineItems: z.array(z.object({
        label: z.string(),
        amount: z.number().int().positive(),
        quantity: z.number().int().positive().optional(),
        unitPrice: z.number().int().positive().optional()
    })).optional(),

    sourceName: z.string().optional(),
    personId: z.string().uuid().optional(),
    personName: z.string().optional(),
    debtId: z.string().uuid().optional(),
    direction: z.enum(['RECEIVE', 'PAY']).optional()

}).refine((data) => {
    if (['EXPENSE', 'INCOME'].includes(data.type)) {
        return !!data.assetId && !!data.splits && data.splits.length > 0;
    }
    return true;
}, {
    message: "Asset and Splits are required for Expense/Income",
    path: ["assetId", "splits"]
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
    bySource: z.array(z.object({ sourceId: z.string(), sourceName: z.string(), amount: z.number() })),
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
