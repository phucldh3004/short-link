#!/usr/bin/env node

console.log('🔍 Testing Firebase Environment Variables...\n');

const requiredVars = [
  'FIREBASE_TYPE',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL',
];

const optionalVars = [
  'FIREBASE_AUTH_URI',
  'FIREBASE_TOKEN_URI',
  'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
  'FIREBASE_UNIVERSE_DOMAIN',
];

let allRequiredVarsPresent = true;
let missingVars = [];

console.log('📋 Required Variables:');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(
      `✅ ${varName}: ${varName.includes('KEY') ? '[HIDDEN]' : value}`,
    );
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequiredVarsPresent = false;
    missingVars.push(varName);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n📊 Summary:');
if (allRequiredVarsPresent) {
  console.log('✅ All required Firebase variables are present');

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

  console.log('\n🚀 Firebase should initialize successfully');
} else {
  console.log('❌ Missing required Firebase variables:');
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log('\n⚠️  Firebase will not initialize');
}

console.log('\n💡 Tips:');
console.log('- Make sure all variables are set in Railway environment');
console.log('- Check that FIREBASE_PRIVATE_KEY is properly formatted');
console.log(
  '- Verify that FIREBASE_PRIVATE_KEY_ID matches your service account',
);
