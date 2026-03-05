import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import { SourcesService } from './sources/sources.service';
import { SourcesController } from './sources/sources.controller';
import { AssetsService } from './assets/assets.service';
import { AssetsController } from './assets/assets.controller';
import { ReportsService } from './reports/reports.service';
import { ReportsController } from './reports/reports.controller';
import { CategoriesService } from './categories/categories.service';
import { CategoriesController } from './categories/categories.controller';
import { MerchantsService } from './merchants/merchants.service';
import { MerchantsController } from './merchants/merchants.controller';
import { DebtsService } from './debts/debts.service';
import { DebtsController } from './debts/debts.controller';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
    ],
    controllers: [
        TransactionsController,
        AssetsController,
        SourcesController,
        ReportsController,
        CategoriesController,
        MerchantsController,
        DebtsController,
    ],
    providers: [
        TransactionsService,
        SourcesService,
        AssetsService,
        ReportsService,
        CategoriesService,
        MerchantsService,
        DebtsService,
    ],
})
export class AppModule { }

