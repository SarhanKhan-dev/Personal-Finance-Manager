import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { SourcesService } from './sources.service';

const DEFAULT_USER = 'default-user-id';

@Controller('owners')
export class OwnersController {
    constructor(private readonly ownersService: SourcesService) { }

    @Get()
    async findAll() {
        return await this.ownersService.findAll(DEFAULT_USER);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.ownersService.findOne(DEFAULT_USER, id);
    }

    @Post()
    async create(@Body() body: { name: string; type: any; allowNegative?: boolean }) {
        if (!body.type) body.type = 'OWN_FUNDS'; // default
        return await this.ownersService.create(DEFAULT_USER, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        return await this.ownersService.update(DEFAULT_USER, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return await this.ownersService.remove(DEFAULT_USER, id);
    }
}
