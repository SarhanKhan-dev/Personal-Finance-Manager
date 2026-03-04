import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { LoansService } from './loans.service';

@Controller('loans')
export class LoansController {
    constructor(private readonly loansService: LoansService) { }

    @Get()
    findAll() {
        return this.loansService.findAll();
    }

    @Post()
    create(@Body() data: any) {
        return this.loansService.create(data);
    }

    @Post(':id/payment')
    addPayment(@Param('id') id: string, @Body() data: any) {
        return this.loansService.addPayment(+id, data);
    }

    @Get(':id/payments')
    getPayments(@Param('id') id: string) {
        return this.loansService.getPayments(+id);
    }
}
