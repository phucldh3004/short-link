#!/usr/bin/env node

// Test if .env file is loaded
console.log('🔍 Testing .env file loading...');

// Check if dotenv is available
try {
  require('dotenv').config();
  console.log('✅ dotenv loaded successfully');
} catch (error) {
  console.log('❌ dotenv not available');
}

// Check environment variables
console.log('\n📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
console.log('DATABASE_PATH:', process.env.DATABASE_PATH);
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);

// Test NestJS config loading
try {
  const configuration = require('./src/config/configuration').default;
  const config = configuration();
  console.log('\n🎯 NestJS Configuration:');
  console.log('Port:', config.port);
  console.log('Database:', config.database);
  console.log('JWT Secret:', config.jwt.secret ? '***SET***' : 'NOT SET');
  console.log('CORS Origins:', config.cors.origins);
  console.log('Firebase Configured:', config.firebase.isConfigured);
} catch (error) {
  console.log('\n❌ Error loading NestJS config:', error.message);
}
