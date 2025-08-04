import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './config/configuration';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const config = configuration();

    // Enable CORS
    app.enableCors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    console.log('🚀 Application starting...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 Port: ${config.port}`);
    console.log(`🔗 CORS Origins: ${config.cors.origins.join(', ')}`);
    console.log(
      `🔥 Firebase Project: ${config.firebase.projectId || 'NOT SET'}`,
    );
    console.log(`🔐 JWT Secret: ${config.jwt.secret ? 'SET' : 'NOT SET'}`);
    console.log(`💾 Database: ${config.database.database}`);
    console.log(
      `🔄 Database Sync: ${config.database.synchronize ? 'ENABLED' : 'DISABLED'}`,
    );

    // Validate critical configuration in production
    if (process.env.NODE_ENV === 'production') {
      if (!config.jwt.secret) {
        throw new Error('JWT_SECRET is required in production');
      }
    }

    await app.listen(config.port, '0.0.0.0');

    console.log(
      `✅ Application is running on: http://localhost:${config.port}`,
    );
    console.log(
      `🏥 Health check available at: http://localhost:${config.port}/health`,
    );
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
