import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) { }

    @Get()
    findAll() {
        return this.accountsService.findAll();
    }

    @Post()
    create(@Body() data: { name: string; type: string; color: string }) {
        return this.accountsService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: { name: string; color: string }) {
        return this.accountsService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.accountsService.delete(+id);
    }

    @Post('recalc')
    recalc() {
        return this.accountsService.recalcBalances();
    }
}
