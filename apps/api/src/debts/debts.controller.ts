import { Controller, Get, Query, Param } from '@nestjs/common';
import { DebtsService } from './debts.service';

const DEFAULT_USER = 'default-user-id';

@Controller('debts')
export class DebtsController {
    constructor(private readonly debtsService: DebtsService) { }

    @Get('summary')
    async getSummary() {
        return await this.debtsService.getSummary(DEFAULT_USER);
    }

    @Get('receivables')
    async getReceivables(@Query('page') page: string, @Query('pageSize') pageSize: string) {
        return await this.debtsService.getReceivables(DEFAULT_USER, parseInt(page) || 1, parseInt(pageSize) || 20);
    }

    @Get('payables')
    async getPayables(@Query('page') page: string, @Query('pageSize') pageSize: string) {
        return await this.debtsService.getPayables(DEFAULT_USER, parseInt(page) || 1, parseInt(pageSize) || 20);
    }

    @Get('person/:personId')
    async getPersonTimeline(@Param('personId') personId: string) {
        return await this.debtsService.getPersonTimeline(DEFAULT_USER, personId);
    }

    @Get()
    async findAll() {
        const { debts, stats } = await this.debtsService.findAll(DEFAULT_USER);
        const receivables = stats.find((s: any) => s.kind === 'RECEIVABLE');
        const payables = stats.find((s: any) => s.kind === 'PAYABLE');
        return {
            debts,
            summary: {
                receivablePrincipal: receivables?.totalPrincipal || 0,
                receivableOutstanding: receivables?.totalOutstanding || 0,
                payablePrincipal: payables?.totalPrincipal || 0,
                payableOutstanding: payables?.totalOutstanding || 0,
            }
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.debtsService.findOne(DEFAULT_USER, id);
    }
}
