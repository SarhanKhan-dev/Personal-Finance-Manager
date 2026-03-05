import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PeopleController],
    providers: [PeopleService],
    exports: [PeopleService],
})
export class PeopleModule { }
