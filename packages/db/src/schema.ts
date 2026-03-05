import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

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

export const sourcesRelations = relations(sources, ({ many }) => ({
    splits: many(transactionSplits),
    ledgerEntries: many(ledgerEntries),
}));

// Assets (Storage/Payment Instrument)
export const assets = sqliteTable('assets', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    type: text('type', { enum: ['CASH', 'BANK', 'WALLET', 'CARD'] }).notNull(),
    balance: integer('balance').notNull().default(0), // Cached balance
    allowNegative: integer('allow_negative', { mode: 'boolean' }).notNull().default(false),
});

export const assetsRelations = relations(assets, ({ many }) => ({
    transactions: many(transactions),
    ledgerEntries: many(ledgerEntries),
}));

// Merchants
export const merchants = sqliteTable('merchants', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    defaultCategoryId: text('default_category_id'),
});

export const merchantsRelations = relations(merchants, ({ many }) => ({
    transactions: many(transactions),
}));

// Categories
export const categories = sqliteTable('categories', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    parentId: text('parent_id').references((): any => categories.id),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
    parent: one(categories, { fields: [categories.parentId], references: [categories.id], relationName: 'subcategories' }),
    subcategories: many(categories, { relationName: 'subcategories' }),
    transactions: many(transactions),
}));

// Transactions
// Types: INCOME, EXPENSE, OWNERSHIP_TRANSFER, ASSET_TRANSFER, LOAN_GIVEN (lend), LOAN_RECEIVED (borrow), DEBT_PAYMENT
export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    type: text('type').notNull(),
    totalAmount: integer('total_amount').notNull(),
    occurredAt: text('occurred_at').notNull(),
    description: text('description'),
    merchantId: text('merchant_id').references(() => merchants.id),
    categoryId: text('category_id').references(() => categories.id),
    assetId: text('asset_id').references(() => assets.id),          // primary asset (income/expense/loan)
    personId: text('person_id').references(() => people.id),        // for debt transactions
    fromAssetId: text('from_asset_id').references(() => assets.id), // ASSET_TRANSFER
    toAssetId: text('to_asset_id').references(() => assets.id),     // ASSET_TRANSFER
    fromOwnerId: text('from_owner_id').references(() => sources.id),// OWNERSHIP_TRANSFER
    toOwnerId: text('to_owner_id').references(() => sources.id),    // OWNERSHIP_TRANSFER
    status: text('status').notNull().default('POSTED'),             // POSTED, VOIDED
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
    asset: one(assets, { fields: [transactions.assetId], references: [assets.id] }),
    category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
    merchant: one(merchants, { fields: [transactions.merchantId], references: [merchants.id] }),
    person: one(people, { fields: [transactions.personId], references: [people.id] }),
    splits: many(transactionSplits),
    lineItems: many(transactionLines),
    ledgerEntries: many(ledgerEntries),
}));

// Transaction Splits (Source updates)
export const transactionSplits = sqliteTable('transaction_splits', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text('transaction_id').references(() => transactions.id).notNull(),
    sourceId: text('source_id').references(() => sources.id).notNull(),
    amount: integer('amount').notNull(),
});

export const transactionSplitsRelations = relations(transactionSplits, ({ one }) => ({
    transaction: one(transactions, { fields: [transactionSplits.transactionId], references: [transactions.id] }),
    source: one(sources, { fields: [transactionSplits.sourceId], references: [sources.id] }),
}));

// Transaction Line Items
export const transactionLines = sqliteTable('transaction_lines', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    transactionId: text('transaction_id').references(() => transactions.id).notNull(),
    label: text('label').notNull(),
    quantity: integer('quantity'),
    unitPrice: integer('unit_price'),
    amount: integer('amount').notNull(),
});

export const transactionLinesRelations = relations(transactionLines, ({ one }) => ({
    transaction: one(transactions, { fields: [transactionLines.transactionId], references: [transactions.id] }),
}));

// People (for debts)
export const people = sqliteTable('people', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').references(() => users.id).notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
});

export const peopleRelations = relations(people, ({ many }) => ({
    debts: many(debts),
    transactions: many(transactions),
}));

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

export const debtsRelations = relations(debts, ({ one }) => ({
    person: one(people, { fields: [debts.personId], references: [people.id] }),
}));

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

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
    transaction: one(transactions, { fields: [ledgerEntries.transactionId], references: [transactions.id] }),
}));

