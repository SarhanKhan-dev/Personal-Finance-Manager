import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        return await this.assetsService.findAll(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.assetsService.findOne(userId, id);
    }

    @Post()
    async create(@Body() body: { name: string; type: any; allowNegative?: boolean }) {
        const userId = 'default-user-id';
        return await this.assetsService.create(userId, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: any) {
        const userId = 'default-user-id';
        return await this.assetsService.update(userId, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.assetsService.remove(userId, id);
    }
}
