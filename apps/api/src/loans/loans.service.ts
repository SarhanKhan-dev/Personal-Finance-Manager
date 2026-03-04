import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class LoansService {
    constructor(private db: DatabaseService) { }

    async findAll() {
        const res = await this.db.execute(`
      SELECT l.*, p.name as person_name, a.name as account_name, a.color as account_color
      FROM loans l
      JOIN persons p ON l.person_id = p.id
      JOIN accounts a ON l.account_id = a.id
      ORDER BY l.created_at DESC
    `);
        return res.rows;
    }

    async create(data: any) {
        const { direction, person_id, account_id, amount, reason, due_date } = data;
        const res = await this.db.execute(`
      INSERT INTO loans (direction, person_id, account_id, amount, remaining, reason, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [direction, person_id, account_id, amount, amount, reason || null, due_date || null, 'open']);

        // Update account balance
        if (direction === 'given') {
            await this.db.execute('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);
        } else {
            await this.db.execute('UPDATE accounts SET balance = balance + ? WHERE id = ?', [amount, account_id]);
        }

        return res.rows[0];
    }

    async addPayment(loanId: number, data: { amount: number; date: string; notes?: string }) {
        const { amount, date, notes } = data;
        await this.db.execute(`
      INSERT INTO loan_payments (loan_id, amount, date, notes)
      VALUES (?, ?, ?, ?)
    `, [loanId, amount, date, notes || null]);

        const loanRes = await this.db.execute('SELECT * FROM loans WHERE id = ?', [loanId]);
        const loan = loanRes.rows[0] as any;
        const newRemaining = loan.remaining - amount;
        const newStatus = newRemaining <= 0 ? 'settled' : 'partial';

        await this.db.execute(
            'UPDATE loans SET remaining = ?, status = ? WHERE id = ?',
            [newRemaining, newStatus, loanId]
        );

        return { success: true, remaining: newRemaining, status: newStatus };
    }

    async getPayments(loanId: number) {
        const res = await this.db.execute(
            'SELECT * FROM loan_payments WHERE loan_id = ? ORDER BY date DESC',
            [loanId]
        );
        return res.rows;
    }
}
