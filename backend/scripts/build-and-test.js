#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🔨 Building and Testing Application...\n');

// Step 1: Build the application
console.log('📦 Step 1: Building application...');
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
});

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(code);
  }

  console.log('✅ Build completed successfully\n');

  // Step 2: Test environment variables
  console.log('🔍 Step 2: Testing environment variables...');
  const testEnvProcess = spawn('node', ['scripts/test-railway-env.js'], {
    stdio: 'inherit',
  });

  testEnvProcess.on('close', (testCode) => {
    console.log(`\n📊 Environment test completed with code: ${testCode}\n`);

    // Step 3: Start application with detailed logging
    console.log('🚀 Step 3: Starting application with detailed logging...');
    const appProcess = spawn('node', ['dist/main.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });

    // Wait 15 seconds then check if app is running
    setTimeout(() => {
      console.log('\n🏥 Testing application health...');
      const healthCheck = spawn(
        'curl',
        ['-f', 'http://localhost:3000/health'],
        {
          stdio: 'inherit',
        },
      );

      healthCheck.on('close', (healthCode) => {
        if (healthCode === 0) {
          console.log('✅ Application is running and healthy!');
        } else {
          console.log('❌ Application health check failed');
        }

        // Kill the application
        appProcess.kill();
        console.log('\n📊 Test completed');
      });
    }, 15000);

    appProcess.on('error', (error) => {
      console.error('❌ Failed to start application:', error);
    });

    appProcess.on('close', (appCode) => {
      console.log(`\n📊 Application exited with code: ${appCode}`);
    });
  });
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});
