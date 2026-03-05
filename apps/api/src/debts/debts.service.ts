import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and, sql, desc } from 'drizzle-orm';

@Injectable()
export class DebtsService {
    constructor(private readonly dbService: DatabaseService) { }

    async getSummary(userId: string) {
        const db = this.dbService.db;
        const debts = await db.query.debts.findMany({
            where: eq(schema.debts.userId, userId),
        });

        const totalReceivable = debts
            .filter(d => d.kind === 'RECEIVABLE')
            .reduce((a, d) => a + Number(d.outstandingAmount), 0);
        const totalPayable = debts
            .filter(d => d.kind === 'PAYABLE')
            .reduce((a, d) => a + Number(d.outstandingAmount), 0);

        return {
            totalReceivableOutstanding: totalReceivable,
            totalPayableOutstanding: totalPayable,
            totalReceivable: debts.filter(d => d.kind === 'RECEIVABLE').reduce((a, d) => a + Number(d.principalAmount), 0),
            totalPayable: debts.filter(d => d.kind === 'PAYABLE').reduce((a, d) => a + Number(d.principalAmount), 0),
        };
    }

    async getReceivables(userId: string, page: number = 1, pageSize: number = 20) {
        const db = this.dbService.db;
        const debts = await db.query.debts.findMany({
            where: and(eq(schema.debts.userId, userId), eq(schema.debts.kind, 'RECEIVABLE')),
            with: { person: true },
            orderBy: [desc(schema.debts.outstandingAmount)],
        });

        // Aggregate per person
        const perPerson = new Map<string, any>();
        for (const d of debts) {
            const personId = d.personId;
            if (!perPerson.has(personId)) {
                perPerson.set(personId, {
                    personId,
                    personName: d.person?.name || 'Unknown',
                    totalLent: 0,
                    totalReceived: 0,
                    remaining: 0,
                    status: 'OPEN',
                });
            }
            const p = perPerson.get(personId)!;
            p.totalLent += Number(d.principalAmount);
            p.totalReceived += Number(d.principalAmount) - Number(d.outstandingAmount);
            p.remaining += Number(d.outstandingAmount);
            p.status = d.status;
        }

        const result = Array.from(perPerson.values());
        const start = (page - 1) * pageSize;
        return { items: result.slice(start, start + pageSize), count: result.length };
    }

    async getPayables(userId: string, page: number = 1, pageSize: number = 20) {
        const db = this.dbService.db;
        const debts = await db.query.debts.findMany({
            where: and(eq(schema.debts.userId, userId), eq(schema.debts.kind, 'PAYABLE')),
            with: { person: true },
            orderBy: [desc(schema.debts.outstandingAmount)],
        });

        const perPerson = new Map<string, any>();
        for (const d of debts) {
            const personId = d.personId;
            if (!perPerson.has(personId)) {
                perPerson.set(personId, {
                    personId,
                    personName: d.person?.name || 'Unknown',
                    totalBorrowed: 0,
                    totalPaid: 0,
                    remaining: 0,
                    status: 'OPEN',
                });
            }
            const p = perPerson.get(personId)!;
            p.totalBorrowed += Number(d.principalAmount);
            p.totalPaid += Number(d.principalAmount) - Number(d.outstandingAmount);
            p.remaining += Number(d.outstandingAmount);
            p.status = d.status;
        }

        const result = Array.from(perPerson.values());
        const start = (page - 1) * pageSize;
        return { items: result.slice(start, start + pageSize), count: result.length };
    }

    async getPersonTimeline(userId: string, personId: string) {
        const db = this.dbService.db;

        const person = await db.query.people.findFirst({
            where: and(eq(schema.people.userId, userId), eq(schema.people.id, personId)),
        });

        // Get all transactions involving this person
        const transactions = await db.query.transactions.findMany({
            where: and(
                eq(schema.transactions.userId, userId),
                eq(schema.transactions.personId, personId),
                eq(schema.transactions.status, 'POSTED'),
            ),
            orderBy: [desc(schema.transactions.occurredAt)],
            with: { asset: true },
        });

        // Get all debts for this person
        const debts = await db.query.debts.findMany({
            where: and(eq(schema.debts.userId, userId), eq(schema.debts.personId, personId)),
        });

        const timeline = transactions.map(t => ({
            id: t.id,
            date: t.occurredAt,
            type: t.type,
            amount: t.totalAmount,
            assetName: (t as any).asset?.name || null,
            description: t.description,
        }));

        return { person, debts, timeline };
    }

    async findAll(userId: string) {
        const db = this.dbService.db;
        const debts = await db.query.debts.findMany({
            where: eq(schema.debts.userId, userId),
            with: { person: true }
        });
        const totals = await db.select({
            kind: schema.debts.kind,
            totalPrincipal: sql<number>`sum(${schema.debts.principalAmount})`,
            totalOutstanding: sql<number>`sum(${schema.debts.outstandingAmount})`,
            count: sql<number>`count(*)`
        }).from(schema.debts)
            .where(and(eq(schema.debts.userId, userId), eq(schema.debts.status, 'OPEN')))
            .groupBy(schema.debts.kind);
        return { debts, stats: totals };
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.debts.findFirst({
            where: and(eq(schema.debts.userId, userId), eq(schema.debts.id, id)),
            with: { person: true }
        });
    }
}
