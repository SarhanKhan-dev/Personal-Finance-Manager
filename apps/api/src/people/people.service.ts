import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '@finance/db';
import { eq, and, like } from 'drizzle-orm';

@Injectable()
export class PeopleService {
    constructor(private readonly dbService: DatabaseService) { }

    async findAll(userId: string, search?: string) {
        const db = this.dbService.db;
        const people = await db.query.people.findMany({
            where: search
                ? and(eq(schema.people.userId, userId), like(schema.people.name, `%${search}%`))
                : eq(schema.people.userId, userId),
        });
        return JSON.parse(JSON.stringify(people));
    }

    async findOne(userId: string, id: string) {
        const person = await this.dbService.db.query.people.findFirst({
            where: and(eq(schema.people.userId, userId), eq(schema.people.id, id)),
        });
        return JSON.parse(JSON.stringify(person));
    }

    async create(userId: string, data: { name: string; phone?: string }) {
        return await this.dbService.runTransaction(async (tx) => {
            // 1. Create Person
            const [person] = await tx.insert(schema.people).values({
                userId,
                name: data.name,
                phone: data.phone,
            } as any).returning();

            // 2. Create corresponding Owner Source
            await tx.insert(schema.sources).values({
                userId,
                personId: person.id,
                name: data.name,
                type: 'OWNED',
                balance: 0,
            } as any);

            return person;
        });
    }

    async update(userId: string, id: string, data: { name?: string; phone?: string }) {
        return await this.dbService.runTransaction(async (tx) => {
            const [person] = await tx.update(schema.people)
                .set(data)
                .where(and(eq(schema.people.userId, userId), eq(schema.people.id, id)))
                .returning();

            if (data.name) {
                await tx.update(schema.sources)
                    .set({ name: data.name })
                    .where(and(eq(schema.sources.userId, userId), eq(schema.sources.personId, id)));
            }

            return person;
        });
    }

    async remove(userId: string, id: string) {
        return await this.dbService.runTransaction(async (tx) => {
            const [person] = await tx.delete(schema.people)
                .where(and(eq(schema.people.userId, userId), eq(schema.people.id, id)))
                .returning();

            await tx.delete(schema.sources)
                .where(and(eq(schema.sources.userId, userId), eq(schema.sources.personId, id)));

            return person;
        });
    }
}
