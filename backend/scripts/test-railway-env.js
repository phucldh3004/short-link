#!/usr/bin/env node

console.log('🚂 Testing Railway Environment Variables...\n');

// Test all environment variables
const testVars = [
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

console.log('📋 Required Variables Check:');
let missingCount = 0;
testVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
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
    missingCount++;
  }
});

console.log(
  `\n📊 Summary: ${testVars.length - missingCount}/${testVars.length} variables set`,
);

if (missingCount > 0) {
  console.log(`⚠️  ${missingCount} variables are missing`);
} else {
  console.log('✅ All variables are set');
}

// Test Firebase specific validation
console.log('\n🔥 Firebase Configuration Test:');
const firebaseVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL',
];

const missingFirebaseVars = firebaseVars.filter(
  (varName) => !process.env[varName],
);

if (missingFirebaseVars.length === 0) {
  console.log('✅ All Firebase variables are present');

  // Test private key format
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    const processedKey = privateKey.replace(/\\n/g, '\n');
    if (processedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('✅ Firebase private key format is valid');
    } else {
      console.log('❌ Firebase private key format is invalid');
    }
  }
} else {
  console.log('❌ Missing Firebase variables:');
  missingFirebaseVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
}

// Test JWT configuration
console.log('\n🔐 JWT Configuration Test:');
const jwtVars = ['JWT_SECRET', 'JWT_EXPIRES_IN'];
const missingJwtVars = jwtVars.filter((varName) => !process.env[varName]);

if (missingJwtVars.length === 0) {
  console.log('✅ All JWT variables are present');
} else {
  console.log('❌ Missing JWT variables:');
  missingJwtVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
}

console.log('\n💡 Railway Deployment Tips:');
console.log('- Make sure all variables are set in Railway dashboard');
console.log('- Check that sensitive values are properly escaped');
console.log('- Verify Firebase service account key is correctly formatted');
console.log('- Ensure JWT_SECRET is set for production');
