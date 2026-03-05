import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        const { merchants, stats } = await this.merchantsService.findAll(userId);

        const totalCount = merchants.length;
        const totalVolume = stats.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
        const topMerchantByFreq = [...stats].sort((a, b) => (b.txCount || 0) - (a.txCount || 0))[0];
        const topMerchantByValue = [...stats].sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0))[0];

        const topFreqName = merchants.find(m => m.id === topMerchantByFreq?.merchantId)?.name || 'N/A';
        const topValueName = merchants.find(m => m.id === topMerchantByValue?.merchantId)?.name || 'N/A';

        return {
            merchants,
            summary: {
                totalCount,
                totalVolume,
                mostFrequent: topFreqName,
                highestValue: topValueName
            }
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.merchantsService.findOne(userId, id);
    }

    @Post()
    async create(@Body() body: { name: string; defaultCategoryId?: string }) {
        const userId = 'default-user-id';
        return await this.merchantsService.create(userId, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: { name?: string; defaultCategoryId?: string }) {
        const userId = 'default-user-id';
        return await this.merchantsService.update(userId, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.merchantsService.remove(userId, id);
    }
}
