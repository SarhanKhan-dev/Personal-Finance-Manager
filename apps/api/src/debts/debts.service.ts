import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db/src/schema';
import { eq, and, sql } from 'drizzle-orm';

@Injectable()
export class DebtsService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string) {
        const debts = await this.dbService.db.query.debts.findMany({
            where: eq(schema.debts.userId, userId),
            with: {
                person: true
            }
        });

        const totals = await this.dbService.db.select({
            kind: schema.debts.kind,
            totalPrincipal: sql<number>`sum(${schema.debts.principalAmount})`,
            totalOutstanding: sql<number>`sum(${schema.debts.outstandingAmount})`,
            count: sql<number>`count(*)`
        })
            .from(schema.debts)
            .where(and(eq(schema.debts.userId, userId), eq(schema.debts.status, 'OPEN')))
            .groupBy(schema.debts.kind);

        return {
            debts,
            stats: totals
        };
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.debts.findFirst({
            where: and(eq(schema.debts.userId, userId), eq(schema.debts.id, id)),
            with: { person: true }
        });
    }

    async create(userId: string, data: any) {
        return await this.dbService.db.insert(schema.debts).values({
            userId,
            ...data
        }).returning();
    }

    async update(userId: string, id: string, data: any) {
        return await this.dbService.db.update(schema.debts)
            .set(data)
            .where(and(eq(schema.debts.userId, userId), eq(schema.debts.id, id)))
            .returning();
    }

    async remove(userId: string, id: string) {
        return await this.dbService.db.delete(schema.debts)
            .where(and(eq(schema.debts.userId, userId), eq(schema.debts.id, id)))
            .returning();
    }
}
