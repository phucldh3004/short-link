# 🚂 Railway Deployment Guide

Hướng dẫn deploy backend lên Railway.

## 📋 Prerequisites

- Railway account: [railway.app](https://railway.app)
- Railway CLI: `npm install -g @railway/cli`
- Firebase project đã được cấu hình
- File `firebase.json` có sẵn

## 🚀 Quick Start

### 1. Cài đặt Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login vào Railway

```bash
railway login
```

### 3. Tạo project mới

```bash
railway init
```

### 4. Setup Environment Variables

Chạy script để lấy Firebase config:

```bash
node scripts/railway-setup.js
```

Sau đó thêm các environment variables vào Railway dashboard:

#### Firebase Configuration

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40project.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

#### Application Configuration

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
SHORTLINK_CODE_LENGTH=6
THROTTLER_TTL=60
THROTTLER_LIMIT=100
```

### 5. Deploy

```bash
railway up
```

### 6. Kiểm tra deployment

```bash
railway status
railway logs
```

## 📁 File Structure

```
backend/
├── railway.json              # Railway configuration
├── scripts/
│   └── railway-setup.js      # Setup script
├── RAILWAY_SETUP.md          # This guide
└── README.md                 # Updated with Railway instructions
```

## 🔧 Configuration

### railway.json

- **Builder**: NIXPACKS (automatic detection)
- **Start Command**: `npm run start:prod`
- **Health Check**: `/health` endpoint
- **Restart Policy**: ON_FAILURE with max 10 retries

### Environment Variables

Railway sẽ tự động detect các environment variables từ file `.env` và Railway dashboard.

## 🛠️ Troubleshooting

### Build Errors

```bash
# Check build logs
railway logs

# Redeploy
railway up
```

### Environment Variables

```bash
# List current variables
railway variables

# Set variable
railway variables set JWT_SECRET=your-secret
```

### Health Check Issues

```bash
# Check health endpoint
curl https://your-app.railway.app/health

# Check logs
railway logs
```

## 📊 Monitoring

### View Logs

```bash
# Real-time logs
railway logs --follow

# Recent logs
railway logs --tail 100
```

### Check Status

```bash
# Service status
railway status

# Service info
railway service
```

### Custom Domain

```bash
# Add custom domain
railway domain add your-domain.com
```

## 🔒 Security

### Environment Variables

- Railway encrypts all environment variables
- Variables are only accessible to your team
- No sensitive data in code

### Firebase Security

- Service account credentials stored securely
- Private key properly escaped for Railway
- Project isolation

## 🚀 Deployment Commands

```bash
# Deploy to production
railway up

# Deploy to specific environment
railway up --environment production

# Deploy with specific service
railway up --service backend

# View deployment status
railway status

# View logs
railway logs

# Open in browser
railway open
```

## 📝 Useful Commands

```bash
# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# View logs
railway logs

# Check status
railway status

# Open dashboard
railway open

# Connect to database (if using Railway DB)
railway connect
```

## 🧪 Testing

### Test Health Endpoint

```bash
curl https://your-app.railway.app/health
```

### Test API Endpoints

```bash
# Test register
curl -X POST https://your-app.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Documentation](https://docs.railway.app/reference/cli)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
