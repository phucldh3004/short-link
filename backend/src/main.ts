import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './config/configuration';

async function bootstrap() {
  // Log all environment variables for debugging
  console.log('🚀 Starting application...');
  console.log('📋 Environment Variables Check:');

  const envVars = [
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'BCRYPT_SALT_ROUNDS',
    'SHORTLINK_CODE_LENGTH',
    'THROTTLER_TTL',
    'THROTTLER_LIMIT',
    'DATABASE_PATH',
    'ALLOWED_ORIGINS',
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI',
    'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'FIREBASE_UNIVERSE_DOMAIN',
  ];

  envVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      // Hide sensitive values
      if (
        varName.includes('SECRET') ||
        varName.includes('KEY') ||
        varName.includes('PRIVATE')
      ) {
        console.log(`✅ ${varName}: [HIDDEN] (${value.length} chars)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: MISSING`);
    }
  });

  console.log('\n🔍 All Environment Variables:');
  Object.keys(process.env).forEach((key) => {
    const value = process.env[key];
    if (
      value &&
      (key.includes('FIREBASE') ||
        key.includes('JWT') ||
        key.includes('NODE_ENV'))
    ) {
      if (
        key.includes('SECRET') ||
        key.includes('KEY') ||
        key.includes('PRIVATE')
      ) {
        console.log(`  ${key}: [HIDDEN] (${value.length} chars)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
  });

  const app = await NestFactory.create(AppModule);
  const config = configuration();

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
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
  console.log(`🔥 Firebase Project: ${config.firebase.projectId || 'NOT SET'}`);
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

  console.log(`✅ Application is running on: http://localhost:${config.port}`);
  console.log(
    `🏥 Health check available at: http://localhost:${config.port}/health`,
  );
}
bootstrap();
