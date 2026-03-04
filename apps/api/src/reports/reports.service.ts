import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
    constructor(private db: DatabaseService) { }

    async getSummary() {
        const inflowRes = await this.db.execute("SELECT SUM(amount) as total FROM transactions WHERE type = 'inflow'");
        const outflowRes = await this.db.execute("SELECT SUM(amount) as total FROM transactions WHERE type = 'outflow'");

        const byCategoryRes = await this.db.execute(`
      SELECT category, SUM(amount) as total 
      FROM transactions 
      WHERE type = 'outflow' AND category IS NOT NULL
      GROUP BY category 
      ORDER BY total DESC
    `);

        const byAccountRes = await this.db.execute(`
      SELECT a.name, a.color, a.type, 
        SUM(CASE WHEN t.type = 'inflow' THEN t.amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN t.type = 'outflow' THEN t.amount ELSE 0 END) as total_outflow
      FROM accounts a
      LEFT JOIN transactions t ON a.id = t.account_id
      GROUP BY a.id
    `);

        const dailyRes = await this.db.execute(`
      SELECT date, 
        SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as inflow,
        SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as outflow
      FROM transactions
      GROUP BY date
      ORDER BY date ASC
      LIMIT 30
    `);

        return {
            inflow: inflowRes.rows[0].total || 0,
            outflow: outflowRes.rows[0].total || 0,
            byCategory: byCategoryRes.rows,
            byAccount: byAccountRes.rows,
            daily: dailyRes.rows
        };
    }
}
