import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

const DEFAULT_USER = 'default-user-id';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('summary')
    async getSummary(
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return await this.reportsService.getDashboardData(DEFAULT_USER, from, to);
    }

    @Get('range')
    async getRange(
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return await this.reportsService.getRange(DEFAULT_USER, from, to);
    }

    @Get('daily')
    async getDaily(@Query('date') date: string) {
        // Daily is just a range of 1 day
        return await this.reportsService.getRange(DEFAULT_USER, date, date);
    }
}
