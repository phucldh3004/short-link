#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function waitForApp() {
  console.log('⏳ Waiting for application to start...');

  for (let i = 0; i < 30; i++) {
    try {
      const response = await axios.get(`${BASE_URL}/health`, { timeout: 2000 });
      if (response.status === 200) {
        console.log('✅ Application is ready!');
        return true;
      }
    } catch (error) {
      // Continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('❌ Application did not start within 30 seconds');
  return false;
}

async function testEndpoints() {
  console.log('\n🧪 Testing endpoints...\n');

  const endpoints = [
    { name: 'Health Check', path: '/health' },
    { name: 'Environment Debug', path: '/debug/env' },
    { name: 'Firebase Status', path: '/firebase/status' },
    { name: 'Firebase Connection Test', path: '/firebase/test' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📋 Testing: ${endpoint.name}`);
      const response = await axios.get(`${BASE_URL}${endpoint.path}`);
      console.log(`✅ ${endpoint.name}: ${response.status}`);

      if (endpoint.path === '/firebase/test') {
        console.log(
          `   Result: ${response.data.success ? 'SUCCESS' : 'FAILED'}`,
        );
        console.log(`   Message: ${response.data.message}`);
      }

      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
      console.log('');
    }
  }
}

async function main() {
  console.log('🚀 Testing Production Application with Firebase...\n');

  // Start the application
  console.log('📦 Starting application...');
  const app = spawn('node', ['dist/main.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  app.on('error', (error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  });

  // Wait for app to start
  const appReady = await waitForApp();

  if (!appReady) {
    app.kill();
    process.exit(1);
  }

  // Test endpoints
  await testEndpoints();

  // Test Firebase connection specifically
  console.log('🔥 Testing Firebase Connection...');
  try {
    const firebaseResponse = await axios.get(`${BASE_URL}/firebase/test`);
    if (firebaseResponse.data.success) {
      console.log('✅ Firebase connection test passed!');
    } else {
      console.log('❌ Firebase connection test failed');
      console.log('Error:', firebaseResponse.data.error || 'Unknown error');
    }
  } catch (error) {
    console.log('❌ Firebase connection test failed:', error.message);
  }

  console.log('\n📊 Test completed');
  console.log('💡 Check the logs above for detailed information');

  // Kill the application
  app.kill();
}

main().catch(console.error);
