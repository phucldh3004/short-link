import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Heroku
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Get port from Heroku environment
  const port = process.env.PORT || 3000;

  console.log(`🚀 Application starting on port ${port}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

  await app.listen(port, '0.0.0.0');

  console.log(`✅ Application is running on: http://localhost:${port}`);
}
bootstrap();
