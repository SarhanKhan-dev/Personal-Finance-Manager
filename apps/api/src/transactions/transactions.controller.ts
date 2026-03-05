import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';

import { TransactionsService } from './transactions.service';
import { CreateTransactionRequest } from '@finance/shared';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    async findAll(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        const userId = 'default-user-id';
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;

        const { transactions, summary, count } = await this.transactionsService.findAll(userId, from, to, pageNum, pageSize);

        return { transactions, summary, count, page: pageNum, pages: Math.ceil(count / pageSize) };
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
