import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionRequest } from '@finance/shared';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        const transactions = await this.transactionsService.findAll(userId);

        const summary = {
            totalVolume: transactions.reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
            outflow: transactions.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
            inflow: transactions.filter((t: any) => t.type === 'INCOME').reduce((acc: number, t: any) => acc + (Number(t.totalAmount) || 0), 0),
            count: transactions.length,
        };

        return { transactions, summary };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.transactionsService.findOne(userId, id);
    }

    @Post()
    async create(@Body() req: CreateTransactionRequest) {
        const userId = 'default-user-id';
        return await this.transactionsService.create(userId, req);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.transactionsService.remove(userId, id);
    }
}
