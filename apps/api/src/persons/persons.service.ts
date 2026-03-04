import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PersonsService {
    constructor(private db: DatabaseService) { }

    async findAll() {
        const res = await this.db.execute('SELECT * FROM persons ORDER BY name');
        return res.rows;
    }

    async create(data: { name: string; phone?: string; notes?: string }) {
        const res = await this.db.execute(
            'INSERT INTO persons (name, phone, notes) VALUES (?, ?, ?)',
            [data.name, data.phone || null, data.notes || null]
        );
        const id = Number(res.lastInsertRowid);
        const person = await this.db.execute('SELECT * FROM persons WHERE id = ?', [id]);
        return person.rows[0];
    }

    async delete(id: number) {
        await this.db.execute('DELETE FROM persons WHERE id = ?', [id]);
        return { success: true };
    }
}
