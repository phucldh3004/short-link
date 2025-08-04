// Test script để simulate Railway environment
const { spawn } = require('child_process');

// Railway environment variables
const railwayEnv = {
  ...process.env,
  PORT: process.env.PORT || '3001',
  NODE_ENV: 'production',
  // Comment out Firebase for now to test other parts
  // FIREBASE_TYPE: 'service_account',
  // FIREBASE_PROJECT_ID: 'short-link-app-51580',
  // FIREBASE_PRIVATE_KEY_ID: '297167b62b91bc2b9d121a75c1fde0cd0f73bae9',
  // FIREBASE_PRIVATE_KEY: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n',
  // FIREBASE_CLIENT_EMAIL: 'firebase-adminsdk-fbsvc@short-link-app-51580.iam.gserviceaccount.com',
  // FIREBASE_CLIENT_ID: '117458469908850696234',
  // FIREBASE_AUTH_URI: 'https://accounts.google.com/o/oauth2/auth',
  // FIREBASE_TOKEN_URI: 'https://oauth2.googleapis.com/token',
  // FIREBASE_AUTH_PROVIDER_X509_CERT_URL: 'https://www.googleapis.com/oauth2/v1/certs',
  // FIREBASE_CLIENT_X509_CERT_URL: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40short-link-app-51580.iam.gserviceaccount.com',
  // FIREBASE_UNIVERSE_DOMAIN: 'googleapis.com',
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  JWT_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: '10',
  ALLOWED_ORIGINS: 'http://localhost:3001',
  DATABASE_PATH: 'shortlink.db',
  SHORTLINK_CODE_LENGTH: '6',
  THROTTLER_TTL: '60',
  THROTTLER_LIMIT: '100',
};

console.log('🚀 Testing Railway Environment...');
console.log('================================');

// Test environment variables
console.log('✅ Environment variables set');
console.log(`📍 Port: ${railwayEnv.PORT}`);
console.log(`🌍 Environment: ${railwayEnv.NODE_ENV}`);
console.log(`🔐 JWT Secret: ${railwayEnv.JWT_SECRET ? 'SET' : 'NOT SET'}`);

// Start the application
console.log('\n🚀 Starting application...');
const app = spawn('node', ['dist/main.js'], {
  env: railwayEnv,
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

// Wait 10 seconds then test health endpoint
setTimeout(() => {
  console.log('\n🏥 Testing health endpoint...');
  const curl = spawn('curl', ['-f', 'http://localhost:3001/health'], {
    stdio: 'inherit',
  });

  curl.on('exit', (code) => {
    if (code === 0) {
      console.log('✅ Health check passed!');
    } else {
      console.log('❌ Health check failed!');
    }
    app.kill();
  });
}, 10000);
