#!/usr/bin/env node

console.log('🔍 Validating Railway Environment Variables...');
console.log('=============================================\n');

const requiredVars = {
  // Firebase Configuration
  FIREBASE_TYPE: 'Firebase service account type',
  FIREBASE_PROJECT_ID: 'Firebase project ID',
  FIREBASE_PRIVATE_KEY_ID: 'Firebase private key ID',
  FIREBASE_PRIVATE_KEY: 'Firebase private key',
  FIREBASE_CLIENT_EMAIL: 'Firebase client email',
  FIREBASE_CLIENT_ID: 'Firebase client ID',
  FIREBASE_CLIENT_X509_CERT_URL: 'Firebase client X509 cert URL',

  // Application Configuration
  NODE_ENV: 'Node environment',
  PORT: 'Application port',
  JWT_SECRET: 'JWT secret key',
  JWT_EXPIRES_IN: 'JWT expiration time',
  BCRYPT_SALT_ROUNDS: 'BCrypt salt rounds',
  SHORTLINK_CODE_LENGTH: 'Shortlink code length',
  THROTTLER_TTL: 'Throttler TTL',
  THROTTLER_LIMIT: 'Throttler limit',
  DATABASE_PATH: 'Database path',
  ALLOWED_ORIGINS: 'CORS allowed origins',
};

const optionalVars = {
  FIREBASE_AUTH_URI: 'Firebase auth URI',
  FIREBASE_TOKEN_URI: 'Firebase token URI',
  FIREBASE_AUTH_PROVIDER_X509_CERT_URL: 'Firebase auth provider X509 cert URL',
  FIREBASE_UNIVERSE_DOMAIN: 'Firebase universe domain',
};

let hasErrors = false;
const missingRequired = [];
const missingOptional = [];

// Check required variables
console.log('📋 Checking Required Variables:');
console.log('-------------------------------');

Object.entries(requiredVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (!value) {
    missingRequired.push(varName);
    console.log(`❌ ${varName}: ${description} - MISSING`);
  } else {
    const displayValue =
      varName.includes('KEY') || varName.includes('SECRET')
        ? `${value.substring(0, 10)}...`
        : value;
    console.log(`✅ ${varName}: ${description} - ${displayValue}`);
  }
});

// Check optional variables
console.log('\n📋 Checking Optional Variables:');
console.log('--------------------------------');

Object.entries(optionalVars).forEach(([varName, description]) => {
  const value = process.env[varName];
  if (!value) {
    missingOptional.push(varName);
    console.log(`⚠️  ${varName}: ${description} - MISSING (optional)`);
  } else {
    console.log(`✅ ${varName}: ${description} - ${value}`);
  }
});

// Summary
console.log('\n📊 Validation Summary:');
console.log('=====================');

if (missingRequired.length === 0) {
  console.log('✅ All required variables are set!');
} else {
  console.log(`❌ Missing ${missingRequired.length} required variables:`);
  missingRequired.forEach((varName) => {
    console.log(`   - ${varName}: ${requiredVars[varName]}`);
  });
  hasErrors = true;
}

if (missingOptional.length > 0) {
  console.log(`⚠️  Missing ${missingOptional.length} optional variables:`);
  missingOptional.forEach((varName) => {
    console.log(`   - ${varName}: ${optionalVars[varName]}`);
  });
}

// Environment specific checks
console.log('\n🌍 Environment Checks:');
console.log('=====================');

const nodeEnv = process.env.NODE_ENV;
console.log(`Environment: ${nodeEnv || 'development'}`);

if (nodeEnv === 'production') {
  console.log('🔒 Production mode detected');

  // Check for secure JWT secret
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.log(
      '⚠️  Warning: JWT_SECRET should be at least 32 characters long',
    );
  }

  // Check for strong password
  if (jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
    console.log('❌ Error: JWT_SECRET is still using default value');
    hasErrors = true;
  }
} else {
  console.log('🔧 Development mode detected');
}

// Firebase configuration check
console.log('\n🔥 Firebase Configuration:');
console.log('==========================');

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;

if (firebaseProjectId && firebasePrivateKey) {
  console.log('✅ Firebase configuration is complete');

  // Validate private key format
  if (firebasePrivateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.log('✅ Firebase private key format is correct');
  } else {
    console.log('⚠️  Firebase private key might be base64 encoded');
  }
} else {
  console.log('❌ Firebase configuration is incomplete');
  hasErrors = true;
}

// Final result
console.log('\n🎯 Final Result:');
console.log('================');

if (hasErrors) {
  console.log(
    '❌ Validation failed! Please fix the missing required variables.',
  );
  process.exit(1);
} else {
  console.log('✅ Validation passed! Your Railway environment is ready.');
  console.log('\n🚀 You can now deploy to Railway with:');
  console.log('   railway up');
}

console.log('\n📝 Next Steps:');
console.log('1. Add missing variables to Railway dashboard');
console.log('2. Deploy with: railway up');
console.log('3. Check logs with: railway logs');
console.log('4. Monitor with: railway status');
