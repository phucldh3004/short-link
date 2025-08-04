#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...\n');

  try {
    // Test 1: Health check
    console.log('📋 Test 1: Health Check');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test 2: Environment variables
    console.log('📋 Test 2: Environment Variables');
    const envResponse = await axios.get(`${BASE_URL}/debug/env`);
    console.log('✅ Environment debug endpoint accessible');
    console.log('Environment:', envResponse.data.environment);
    console.log('Firebase Status:', envResponse.data.firebaseStatus);
    console.log('');

    // Test 3: Firebase status
    console.log('📋 Test 3: Firebase Status');
    const statusResponse = await axios.get(`${BASE_URL}/firebase/status`);
    console.log('✅ Firebase status endpoint accessible');
    console.log('Firebase Status:', statusResponse.data);
    console.log('');

    // Test 4: Firebase connection test
    console.log('📋 Test 4: Firebase Connection Test');
    const testResponse = await axios.get(`${BASE_URL}/firebase/test`);
    console.log('✅ Firebase connection test completed');
    console.log('Test Result:', testResponse.data);
    console.log('');

    // Summary
    console.log('📊 Summary:');
    console.log(`- Health Check: ✅`);
    console.log(`- Environment Variables: ✅`);
    console.log(`- Firebase Status: ✅`);
    console.log(
      `- Firebase Connection Test: ${testResponse.data.success ? '✅' : '❌'}`,
    );

    if (testResponse.data.success) {
      console.log('\n🎉 All Firebase tests passed!');
    } else {
      console.log('\n⚠️  Firebase connection test failed');
      console.log('Check the logs above for more details');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    process.exit(1);
  }
}

// Test Firebase configuration
async function testFirebaseConfig() {
  console.log('🔧 Testing Firebase Configuration...\n');

  const requiredVars = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL',
  ];

  let allPresent = true;
  console.log('📋 Required Firebase Variables:');

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      if (varName.includes('KEY') || varName.includes('PRIVATE')) {
        console.log(`✅ ${varName}: [HIDDEN] (${value.length} chars)`);
      } else {
        console.log(`✅ ${varName}: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: MISSING`);
      allPresent = false;
    }
  });

  console.log('');
  if (allPresent) {
    console.log('✅ All Firebase variables are present');

    // Test private key format
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      const processedKey = privateKey.replace(/\\n/g, '\n');
      if (processedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        console.log('✅ Firebase private key format is valid');
      } else {
        console.log('❌ Firebase private key format is invalid');
        allPresent = false;
      }
    }
  } else {
    console.log('❌ Some Firebase variables are missing');
  }

  return allPresent;
}

async function main() {
  console.log('🚀 Firebase Connection Test Suite\n');

  // Test configuration first
  const configOk = await testFirebaseConfig();
  console.log('');

  if (!configOk) {
    console.log('⚠️  Firebase configuration is incomplete');
    console.log('Please check your environment variables');
    return;
  }

  // Test connection
  await testFirebaseConnection();
}

main().catch(console.error);
