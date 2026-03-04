import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PersonsModule } from './persons/persons.module';
import { LoansModule } from './loans/loans.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    DatabaseModule,
    AccountsModule,
    TransactionsModule,
    PersonsModule,
    LoansModule,
    ReportsModule,
  ],
})
export class AppModule { }
