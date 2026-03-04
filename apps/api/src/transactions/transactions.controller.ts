import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    findAll(
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
        @Query('accountId') accountId?: string,
        @Query('personId') personId?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string,
    ) {
        return this.transactionsService.findAll({
            limit: limit ? +limit : undefined,
            offset: offset ? +offset : undefined,
            search,
            type,
            accountId: accountId ? +accountId : undefined,
            personId: personId ? +personId : undefined,
            dateFrom,
            dateTo,
        });
    }

    @Post()
    create(@Body() data: any) {
        return this.transactionsService.create(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.transactionsService.delete(+id);
    }
}
