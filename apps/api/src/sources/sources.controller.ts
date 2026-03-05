import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { SourcesService } from './sources.service';

@Controller('sources')
export class SourcesController {
    constructor(private readonly sourcesService: SourcesService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        return await this.sourcesService.findAll(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.sourcesService.findOne(userId, id);
    }

    @Post()
    async create(@Body() body: { name: string; type: any; allowNegative?: boolean }) {
        const userId = 'default-user-id';
        return await this.sourcesService.create(userId, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const userId = 'default-user-id';
        return await this.sourcesService.update(userId, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.sourcesService.remove(userId, id);
    }
}
