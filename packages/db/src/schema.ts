import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users
export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    email: text('email').unique().notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Sources (Ownership)
export const sources = sqliteTable('sources', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    type: text('type', { enum: ['OWNED', 'LOAN_RECEIVABLE', 'LOAN_PAYABLE', 'SAVINGS'] }).notNull().default('OWNED'),
    balance: integer('balance').notNull().default(0), // Cached balance
    allowNegative: integer('allow_negative', { mode: 'boolean' }).notNull().default(false),
});

// Assets (Storage/Payment Instrument)
export const assets = sqliteTable('assets', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    type: text('type', { enum: ['CASH', 'BANK', 'WALLET', 'CARD'] }).notNull(),
    balance: integer('balance').notNull().default(0), // Cached balance
    allowNegative: integer('allow_negative', { mode: 'boolean' }).notNull().default(false),
});

// Merchants
export const merchants = sqliteTable('merchants', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    defaultCategoryId: text('default_category_id'),
});

// Categories
export const categories = sqliteTable('categories', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    parentId: text('parent_id').references((): any => categories.id),
});

// Transactions
export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    type: text('type').notNull(), // EXPENSE, INCOME, etc.
    totalAmount: integer('total_amount').notNull(),
    occurredAt: text('occurred_at').notNull(),
    description: text('description'),
    merchantId: text('merchant_id').references(() => merchants.id),
    categoryId: text('category_id').references(() => categories.id),
    assetId: text('asset_id').references(() => assets.id),
    status: text('status').notNull().default('POSTED'), // POSTED, VOIDED
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Transaction Splits (Source updates)
export const transactionSplits = sqliteTable('transaction_splits', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text('transaction_id').references(() => transactions.id).notNull(),
    sourceId: text('source_id').references(() => sources.id).notNull(),
    amount: integer('amount').notNull(),
});

// Transaction Line Items
export const transactionLines = sqliteTable('transaction_lines', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text('transaction_id').references(() => transactions.id).notNull(),
    label: text('label').notNull(),
    quantity: integer('quantity'),
    unitPrice: integer('unit_price'),
    amount: integer('amount').notNull(),
});

// People (for debts)
export const people = sqliteTable('people', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
});

// Debts
export const debts = sqliteTable('debts', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    personId: text('person_id').references(() => people.id).notNull(),
    kind: text('kind', { enum: ['RECEIVABLE', 'PAYABLE'] }).notNull(),
    principalAmount: integer('principal_amount').notNull(),
    outstandingAmount: integer('outstanding_amount').notNull(),
    status: text('status').notNull().default('OPEN'), // OPEN, CLOSED
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Ledger Entries (The source of truth for all movements)
export const ledgerEntries = sqliteTable('ledger_entries', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    transactionId: text('transaction_id').references(() => transactions.id),
    entityType: text('entity_type', { enum: ['SOURCE', 'ASSET', 'DEBT'] }).notNull(),
    entityId: text('entity_id').notNull(),
    direction: text('direction', { enum: ['DEBIT', 'CREDIT'] }).notNull(),
    amount: integer('amount').notNull(),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
