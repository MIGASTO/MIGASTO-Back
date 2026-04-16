import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  });

  if (!process.env.VERCEL) {
    const port = process.env.SERVER_PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Server running on http://localhost:${port}/api`);
  }

  return app;
}

bootstrap();
