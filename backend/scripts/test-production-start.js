#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Testing Production Startup...');
console.log('================================');

// Production environment variables
const productionEnv = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: process.env.PORT || '3001',
  JWT_SECRET: 'test-jwt-secret-for-production-test',
  JWT_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: '10',
  SHORTLINK_CODE_LENGTH: '6',
  THROTTLER_TTL: '60',
  THROTTLER_LIMIT: '100',
  DATABASE_PATH: 'shortlink.db',
  ALLOWED_ORIGINS: '*',
  // Firebase config (optional for testing)
  FIREBASE_TYPE: 'service_account',
  FIREBASE_PROJECT_ID: 'test-project',
  FIREBASE_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
  FIREBASE_CLIENT_EMAIL: 'test@test.com',
  FIREBASE_CLIENT_ID: '123456789',
  FIREBASE_CLIENT_X509_CERT_URL: 'https://test.com',
};

console.log('📋 Environment variables set for production test');
console.log(`🌍 NODE_ENV: ${productionEnv.NODE_ENV}`);
console.log(`📍 PORT: ${productionEnv.PORT}`);
console.log(`🔐 JWT_SECRET: ${productionEnv.JWT_SECRET ? 'SET' : 'NOT SET'}`);

// Start the application
console.log('\n🚀 Starting application in production mode...');
const app = spawn('node', ['dist/main.js'], {
  env: productionEnv,
  stdio: 'inherit',
});

app.on('error', (error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

app.on('exit', (code) => {
  console.log(`\n📊 Application exited with code: ${code}`);
  process.exit(code);
});

// Wait 15 seconds then test health endpoint
setTimeout(() => {
  console.log('\n🏥 Testing health endpoint...');
  const curl = spawn(
    'curl',
    ['-f', `http://localhost:${productionEnv.PORT}/health`],
    {
      stdio: 'inherit',
    },
  );

  curl.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Health check passed!');
    } else {
      console.log('❌ Health check failed!');
      console.log('🔍 This might indicate the issue on Railway');
    }
    app.kill();
  });
}, 15000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping application...');
  app.kill();
  process.exit(0);
});
