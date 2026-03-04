import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { PersonsService } from './persons.service';

@Controller('persons')
export class PersonsController {
    constructor(private readonly personsService: PersonsService) { }

    @Get()
    findAll() {
        return this.personsService.findAll();
    }

    @Post()
    create(@Body() data: { name: string; phone?: string; notes?: string }) {
        return this.personsService.create(data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.personsService.delete(+id);
    }
}
