import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionRequest } from '@finance/shared';

const DEFAULT_USER = 'default-user-id';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    async findAll(
        @Query('from') from: string,
        @Query('to') to: string,
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('type') type: string,
        @Query('categoryId') categoryId: string,
        @Query('merchantId') merchantId: string,
        @Query('ownerId') ownerId: string,
        @Query('assetId') assetId: string,
        @Query('personId') personId: string,
    ) {
        const pageNum = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 20;
        const result = await this.transactionsService.findAll(DEFAULT_USER, {
            from, to, page: pageNum, limit: pageSize,
            type, categoryId, merchantId, ownerId, assetId, personId
        });
        return { ...result, page: pageNum, pages: Math.ceil(result.count / pageSize) };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.transactionsService.findOne(DEFAULT_USER, id);
    }

    @Post()
    async create(@Body() req: CreateTransactionRequest) {
        return await this.transactionsService.create(DEFAULT_USER, req);
    }

    @Post(':id/void')
    async void(@Param('id') id: string) {
        return await this.transactionsService.void(DEFAULT_USER, id);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.transactionsService.void(DEFAULT_USER, id);
    }
}
