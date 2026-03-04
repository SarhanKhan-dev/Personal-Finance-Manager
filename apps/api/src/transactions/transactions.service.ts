import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionsService {
    constructor(private db: DatabaseService) { }

    async findAll(filters: any = {}) {
        const { limit, offset, search, type, accountId, personId, dateFrom, dateTo } = filters;
        let query = `
      SELECT t.*, 
        a.name as account_name, a.type as account_type, a.color as account_color,
        ta.name as to_account_name, ta.color as to_account_color,
        p.name as person_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      LEFT JOIN persons p ON t.person_id = p.id
      WHERE 1=1
    `;
        const params = [];
        if (search) {
            query += ` AND (t.notes LIKE ? OR t.source_label LIKE ? OR t.category LIKE ? OR p.name LIKE ? OR a.name LIKE ?)`;
            const s = `%${search}%`; params.push(s, s, s, s, s);
        }
        if (type) { query += ` AND t.type = ?`; params.push(type); }
        if (accountId) { query += ` AND (t.account_id = ? OR t.to_account_id = ?)`; params.push(accountId, accountId); }
        if (personId) { query += ` AND t.person_id = ?`; params.push(personId); }
        if (dateFrom) { query += ` AND t.date >= ?`; params.push(dateFrom); }
        if (dateTo) { query += ` AND t.date <= ?`; params.push(dateTo); }
        query += ` ORDER BY t.date DESC, t.created_at DESC`;
        if (limit) { query += ` LIMIT ? OFFSET ?`; params.push(limit, offset || 0); }

        const res = await this.db.execute(query, params);
        return res.rows;
    }

    async create(data: any) {
        const { type, amount, date, account_id, to_account_id, category, source_label, person_id, notes } = data;
        const res = await this.db.execute(`
      INSERT INTO transactions (type, amount, date, account_id, to_account_id, category, source_label, person_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [type, amount, date, account_id || null, to_account_id || null, category || null, source_label || null, person_id || null, notes || null]);

        const txId = Number(res.lastInsertRowid);

        // Update balances
        if (type === 'inflow' && account_id) {
            await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account_id]);
        } else if (type === 'outflow' && account_id) {
            await this.db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);
        } else if (type === 'transfer' && account_id && to_account_id) {
            await this.db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);
            await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, to_account_id]);
        }

        const tx = await this.db.execute(`
      SELECT t.*, a.name as account_name, a.color as account_color,
        ta.name as to_account_name, ta.color as to_account_color, p.name as person_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN accounts ta ON t.to_account_id = ta.id
      LEFT JOIN persons p ON t.person_id = p.id
      WHERE t.id = ?
    `, [txId]);
        return tx.rows[0];
    }

    async delete(id: number) {
        const res = await this.db.execute('SELECT * FROM transactions WHERE id = ?', [id]);
        const tx = res.rows[0] as any;
        if (tx) {
            if (tx.type === 'inflow' && tx.account_id) {
                await this.db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [tx.amount, tx.account_id]);
            } else if (tx.type === 'outflow' && tx.account_id) {
                await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [tx.amount, tx.account_id]);
            } else if (tx.type === 'transfer') {
                if (tx.account_id) await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [tx.amount, tx.account_id]);
                if (tx.to_account_id) await this.db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [tx.amount, tx.to_account_id]);
            }
            await this.db.execute('DELETE FROM transactions WHERE id = ?', [id]);
        }
        return { success: true };
    }
}
