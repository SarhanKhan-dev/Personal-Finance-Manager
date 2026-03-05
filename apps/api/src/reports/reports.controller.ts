import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('summary')
    async getSummary(
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        const userId = 'default-user-id';
        return await this.reportsService.getDashboardData(userId, from, to);

    }
}
