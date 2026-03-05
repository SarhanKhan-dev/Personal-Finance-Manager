import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedApp: any;

async function bootstrap() {
    if (process.env.VERCEL) return; // Don't run bootstrap on Vercel
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true, credentials: true });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 API running on: http://localhost:${port}`);
}

bootstrap();

// For Vercel Serverless
export default async function handler(req: any, res: any) {
    if (!cachedApp) {
        const app = await NestFactory.create(AppModule);
        app.enableCors({ origin: true, credentials: true });
        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp(req, res);
}
