import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { PeopleService } from './people.service';

const DEFAULT_USER = 'default-user-id';

@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) { }

    @Get()
    async findAll(@Query('search') search: string) {
        return await this.peopleService.findAll(DEFAULT_USER, search);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.peopleService.findOne(DEFAULT_USER, id);
    }

    @Post()
    async create(@Body() body: { name: string; phone?: string }) {
        return await this.peopleService.create(DEFAULT_USER, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: { name?: string; phone?: string }) {
        return await this.peopleService.update(DEFAULT_USER, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.peopleService.remove(DEFAULT_USER, id);
    }
}
