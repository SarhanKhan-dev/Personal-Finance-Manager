import { Module, Controller, Get } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { TransactionsService } from './transactions/transactions.service';
import { TransactionsController } from './transactions/transactions.controller';
import { SourcesService } from './sources/sources.service';
import { OwnersController } from './sources/sources.controller';
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
import { PeopleService } from './people/people.service';
import { PeopleController } from './people/people.controller';

@Controller('health')
class HealthController {
    @Get()
    getHealth() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}

@Module({
    imports: [
        ScheduleModule.forRoot(),
        DatabaseModule,
    ],
    controllers: [
        HealthController,
        TransactionsController,
        AssetsController,
        OwnersController,
        ReportsController,
        CategoriesController,
        MerchantsController,
        DebtsController,
        PeopleController,
    ],
    providers: [
        TransactionsService,
        SourcesService,
        AssetsService,
        ReportsService,
        CategoriesService,
        MerchantsService,
        DebtsService,
        PeopleService,
    ],
})
export class AppModule { }


