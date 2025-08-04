console.log('🔍 Testing Environment Variables...');
console.log('=====================================');
console.log();

// Test Firebase Environment Variables
const firebaseVars = [
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

console.log('🔥 Firebase Variables:');
firebaseVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '❌';
  console.log(`${status} ${varName}: ${value ? 'SET' : 'MISSING'}`);
});

console.log();

// Test App Variables
const appVars = [
  'PORT',
  'NODE_ENV',
  'ALLOWED_ORIGINS',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'BCRYPT_SALT_ROUNDS',
  'DATABASE_PATH',
  'SHORTLINK_CODE_LENGTH',
  'THROTTLER_TTL',
  'THROTTLER_LIMIT',
];

console.log('⚙️ App Variables:');
appVars.forEach((varName) => {
  const value = process.env[varName];
  const status = value ? '✅' : '⚠️';
  console.log(`${status} ${varName}: ${value || 'DEFAULT'}`);
});

console.log();
console.log('✅ Test completed!');
