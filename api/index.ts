import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let app;

async function initializeApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Pipes globales para validaciones
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    await app.init();
  }
  return app;
}

export default async (req, res) => {
  const app = await initializeApp();
  await app.getHttpAdapter().getInstance()(req, res);
};
