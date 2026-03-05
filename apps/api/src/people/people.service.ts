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
        return people;
    }

    async findOne(userId: string, id: string) {
        return await this.dbService.db.query.people.findFirst({
            where: and(eq(schema.people.userId, userId), eq(schema.people.id, id)),
        });
    }

    async create(userId: string, data: { name: string; phone?: string }) {
        const [person] = await this.dbService.db.insert(schema.people).values({
            userId,
            name: data.name,
            phone: data.phone,
        } as any).returning();
        return person;
    }

    async update(userId: string, id: string, data: { name?: string; phone?: string }) {
        const [person] = await this.dbService.db.update(schema.people)
            .set(data)
            .where(and(eq(schema.people.userId, userId), eq(schema.people.id, id)))
            .returning();
        return person;
    }

    async remove(userId: string, id: string) {
        const [person] = await this.dbService.db.delete(schema.people)
            .where(and(eq(schema.people.userId, userId), eq(schema.people.id, id)))
            .returning();
        return person;
    }
}
