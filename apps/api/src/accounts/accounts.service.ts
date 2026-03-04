import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AccountsService {
    constructor(private db: DatabaseService) { }

    async findAll() {
        const res = await this.db.execute('SELECT * FROM accounts ORDER BY id');
        return res.rows;
    }

    async create(data: { name: string; type: string; color: string }) {
        const { name, type, color } = data;
        const res = await this.db.execute(
            'INSERT INTO accounts (name, type, color) VALUES (?, ?, ?)',
            [name, type, color || '#8b5cf6'],
        );
        const id = Number(res.lastInsertRowid);
        const account = await this.db.execute(
            'SELECT * FROM accounts WHERE id = ?',
            [id],
        );
        return account.rows[0];
    }

    async update(id: number, data: { name: string; color: string }) {
        const { name, color } = data;
        await this.db.execute(
            'UPDATE accounts SET name = ?, color = ? WHERE id = ?',
            [name, color, id],
        );
        const account = await this.db.execute(
            'SELECT * FROM accounts WHERE id = ?',
            [id],
        );
        return account.rows[0];
    }

    async delete(id: number) {
        await this.db.execute('DELETE FROM accounts WHERE id = ?', [id]);
        return { success: true };
    }

    async recalcBalances() {
        const accountsRes = await this.db.execute('SELECT id FROM accounts');
        const accounts = accountsRes.rows;

        for (const acc of accounts) {
            const accId = Number(acc.id);

            const inflowRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE account_id = ? AND type = 'inflow'",
                [accId],
            );
            const outflowRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE account_id = ? AND type = 'outflow'",
                [accId],
            );
            const transferOutRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE account_id = ? AND type = 'transfer'",
                [accId],
            );
            const transferInRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE to_account_id = ? AND type = 'transfer'",
                [accId],
            );
            const loanGivenRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE account_id = ? AND direction = 'given'",
                [accId],
            );
            const loanTakenRes = await this.db.execute(
                "SELECT COALESCE(SUM(amount), 0) as total FROM loans WHERE account_id = ? AND direction = 'taken'",
                [accId],
            );

            const balance =
                Number(inflowRes.rows[0].total) +
                Number(transferInRes.rows[0].total) +
                Number(loanTakenRes.rows[0].total) -
                Number(outflowRes.rows[0].total) -
                Number(transferOutRes.rows[0].total) -
                Number(loanGivenRes.rows[0].total);

            await this.db.execute(
                'UPDATE accounts SET balance = ? WHERE id = ?',
                [balance, accId],
            );
        }

        const finalRes = await this.db.execute('SELECT * FROM accounts ORDER BY id');
        return finalRes.rows;
    }
}
