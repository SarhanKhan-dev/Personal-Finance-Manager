import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Get()
    async findAll() {
        const userId = 'default-user-id';
        const { categories, stats } = await this.categoriesService.findAll(userId);

        const totalCategories = categories.length;
        const totalCategorizedSpend = stats.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
        const mostUsedCategory = [...stats].sort((a, b) => (b.txCount || 0) - (a.txCount || 0))[0];
        const highestSpendCategory = [...stats].sort((a, b) => (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0))[0];

        const mostUsedName = categories.find(c => c.id === mostUsedCategory?.categoryId)?.name || 'N/A';
        const highestSpendName = categories.find(c => c.id === highestSpendCategory?.categoryId)?.name || 'N/A';

        const categoriesWithStats = categories.map(c => {
            const s = stats.find(stat => stat.categoryId === c.id);
            return {
                ...c,
                stats: {
                    totalAmount: Number(s?.totalAmount) || 0,
                    txCount: Number(s?.txCount) || 0
                }
            };
        });

        return {
            categories: categoriesWithStats,
            summary: {
                totalCount: totalCategories,
                totalSpend: totalCategorizedSpend,
                mostActive: mostUsedName,
                highestSpend: highestSpendName
            }
        };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.categoriesService.findOne(userId, id);
    }

    @Post()
    async create(@Body() body: { name: string; parentId?: string }) {
        const userId = 'default-user-id';
        return await this.categoriesService.create(userId, body);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() body: { name?: string; parentId?: string }) {
        const userId = 'default-user-id';
        return await this.categoriesService.update(userId, id, body);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const userId = 'default-user-id';
        return await this.categoriesService.remove(userId, id);
    }
}
