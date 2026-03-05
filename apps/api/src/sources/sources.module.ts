import { Module } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { OwnersController } from './sources.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OwnersController],
    providers: [SourcesService],
    exports: [SourcesService],
})
export class SourcesModule { }
