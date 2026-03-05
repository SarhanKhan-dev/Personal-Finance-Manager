import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { DebtsService } from './debts.service';

@Controller('debts')
export class DebtsController {
    constructor(private readonly debtsService: DebtsService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        const { debts, stats } = await this.debtsService.findAll(userId);

        const receivables = stats.find(s => s.kind === 'RECEIVABLE');
        const payables = stats.find(s => s.kind === 'PAYABLE');

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
        const userId = 'default-user-id';
        return await this.debtsService.findOne(userId, id);
    }

    @Post()
    async create(@Body() body: any) {
        const userId = 'default-user-id';
        return await this.debtsService.create(userId, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const userId = 'default-user-id';
        return await this.debtsService.update(userId, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.debtsService.remove(userId, id);
    }
}
