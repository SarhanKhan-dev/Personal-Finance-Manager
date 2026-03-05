import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 API running on: http://localhost:${port}`);
}

bootstrap();

// For Vercel Serverless
export const bootstrapServer = async () => {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    await app.init();
    return app.getHttpAdapter().getInstance();
};
