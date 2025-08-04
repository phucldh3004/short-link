const fs = require('fs');
const path = require('path');

console.log('🚂 Setting up Railway deployment...\n');

// Read firebase.json
const firebasePath = path.join(process.cwd(), 'firebase.json');
if (!fs.existsSync(firebasePath)) {
  console.error('❌ firebase.json not found!');
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(firebasePath, 'utf8'));

console.log('📋 Railway Environment Variables:');
console.log('Add these to your Railway project variables:\n');

console.log('=== Firebase Configuration ===');
console.log(`FIREBASE_TYPE=${firebaseConfig.type}`);
console.log(`FIREBASE_PROJECT_ID=${firebaseConfig.project_id}`);
console.log(`FIREBASE_PRIVATE_KEY_ID=${firebaseConfig.private_key_id}`);
console.log(
  `FIREBASE_PRIVATE_KEY="${firebaseConfig.private_key.replace(/\n/g, '\\n')}"`,
);
console.log(`FIREBASE_CLIENT_EMAIL=${firebaseConfig.client_email}`);
console.log(`FIREBASE_CLIENT_ID=${firebaseConfig.client_id}`);
console.log(`FIREBASE_AUTH_URI=${firebaseConfig.auth_uri}`);
console.log(`FIREBASE_TOKEN_URI=${firebaseConfig.token_uri}`);
console.log(
  `FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${firebaseConfig.auth_provider_x509_cert_url}`,
);
console.log(
  `FIREBASE_CLIENT_X509_CERT_URL=${firebaseConfig.client_x509_cert_url}`,
);
console.log(`FIREBASE_UNIVERSE_DOMAIN=${firebaseConfig.universe_domain}`);

console.log('\n=== Application Configuration ===');
console.log('NODE_ENV=production');
console.log('PORT=3001');
console.log('JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
console.log('JWT_EXPIRES_IN=7d');
console.log('BCRYPT_SALT_ROUNDS=10');
console.log('SHORTLINK_CODE_LENGTH=6');
console.log('THROTTLER_TTL=60');
console.log('THROTTLER_LIMIT=100');

console.log('\n📝 Instructions:');
console.log('1. Install Railway CLI: npm install -g @railway/cli');
console.log('2. Login to Railway: railway login');
console.log('3. Create new project: railway init');
console.log('4. Add environment variables in Railway dashboard');
console.log('5. Deploy: railway up');

console.log('\n🔗 Railway CLI Commands:');
console.log('railway login');
console.log('railway init');
console.log('railway up');
console.log('railway logs');
console.log('railway status');

console.log('\n✅ Railway setup complete!');
