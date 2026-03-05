import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let cachedApp: any;

export default async (req: any, res: any) => {
    if (!cachedApp) {
        const app = await NestFactory.create(AppModule);
        app.enableCors({ origin: true, credentials: true });
        await app.init();
        cachedApp = app.getHttpAdapter().getInstance();
    }
    return cachedApp(req, res);
};
