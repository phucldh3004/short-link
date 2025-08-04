# 🚀 Railway Deployment Guide

## 📋 Prerequisites

- Railway account
- GitHub repository connected to Railway
- Firebase project setup

## 🔧 Environment Variables Setup

### 1. Firebase Configuration (Required)

```
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=short-link-app-51580
FIREBASE_PRIVATE_KEY_ID=297167b62b91bc2b9d121a75c1fde0cd0f73bae9
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCP2R+zxX9nel9R\ncRHOrfPz948yHLIrKSKevs43pjUBiA1e9kELtGiDmLg8zMaF56xjlVBNhcBPrtHC\nPV7iUQeE33I1BRkrOHaalNgm0ZcUAV3ZSs1W1pZlGyEGBE6w/n9N+eqYNIpZi8YK\n0jrSE4B2OL+Nnz6u4dN8v+oQEwIyOu8CMnoBlUjZpkwSNbmaljEBWfGy6r35hbSY\ntlv+KjXOXPsn0dV/xkTx4a/qSnVuKj3WiftolhHzHzT2IqECMSXlX0cNXKOzQpKU\nOkp1qtXg8fVczf8CIwNIPxoYyGONzQ000HXH+IOVUqdqWA+WNJWFPWdHzRE07P9n\nQlxLYz0nAgMBAAECggEAObiEvZS2ylVy0RG/dQEdPlysk42rOqFveGaVBgSGCX7H\n6r6CnElAlOmfqBn9YTb02CLOjcTpRbAfEEOjAspD65/jyn2ou0yVXvLyByWb61Wf\nDHW1Dq7du2VW63yn/OKqP6ZUac3PZB4vkiEIpEpaBlZAGvp24yLPw6OYrumJvJCK\nWvXAHAV5utktYnBL0fCkcPqNZwqRV6Vq9wuFMYMHH/bx3TIq3QwZkGZZDqnGLGvA\nIs00coSaLaKWZc+8eq0XHKlut6bXC/DVPCR9ej0JdxRoJoUEQ2v2xaYaXgRT3lw+\nqaIppMQ0qXuLSu6Eyyh4353qkYl/H0/1US/8deBjlQKBgQDB5fGIRKSFynWh+o1S\naEOeEgDYKtNne2GSpBB8U8/7V6kJCnYzyIFAld5z56S8hiPH6nKFGPQYw/ej4HOm\n0hKmDA1w0WUteG4LEzpHRCvIEW2P+buFwy3XGCMpzOfviBvhuJzzVti8zsoA+YKM\n4SZtow+NshEKQb20p52smu6d8wKBgQC963yBepygdXWnBlt9tzUUKuuFgPwt0tw7\nByTme/0M/OBi+mopBuy3fSVQ9Z53c+eii7+LiRn2UeK3oCjEIHXIi7G4eWg1PN7s\noP77+kfTnrLVYF++1KRhxFiz8c3P76HJ6PCztxCk+/xB7zUtQjTxk8cAFhswE4mV\n5krQQN9M/QKBgBVO0aYp9PKG9zpfsFwX/SZH0DPxMN40XtqgkPc4tqhmT7sgnTC/\nngSc859FG4NkMlZr2z3pKhn2nyYxKkRw3X/F30xAlp/SljU9XbArO6x2zdV+mi7u\n7gCvNF4JmItoJ7g8c3MCXjsRdn147fHRZEm0G6d0pA6+frx1lww60nIlAoGBAL2v\nZTss6yKYLloTz21QfoMWGwXMPhLGd4+9Iu3RCHzgVHyG/2DaubLKG2sw5oUIDmIa\nkcUbugJ65qXgINdCVGFopKhLGfmSQlS0t/eTkgmah6L2DqraVxQOt0mCSL1V6ZFw\nRng4bzdZNinkcIgziA2AO1GqwpzR5qkAydgV8vFBAoGBAME9ARMZXor/+PUZ+1xt\nnGL6UKsxDEO1aGAh6OZzBIjETII+CMcPCKtsR1p+M5aoIX3coRIXN3b8gcca8eEu\n8xfU0SuV8w9qnD9W016Lyr9L4QMdiNU32HOXtcHs0U3CsHcXwl7IJNsdfyrFOVGi\nhDrsg87dDUoSTcIBM/TMKCcN\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@short-link-app-51580.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=117458469908850696234
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40short-link-app-51580.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### 2. App Configuration (Recommended)

```
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
```

### 3. Security Configuration (Recommended)

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### 4. Optional Configuration

```
DATABASE_PATH=shortlink.db
SHORTLINK_CODE_LENGTH=6
THROTTLER_TTL=60
THROTTLER_LIMIT=100
```

## 🚀 Deployment Steps

### 1. Connect GitHub Repository

1. Go to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### 2. Add Environment Variables

1. Go to your project in Railway
2. Click on "Variables" tab
3. Add each environment variable listed above
4. Make sure to copy the exact values

### 3. Deploy

1. Railway will automatically build and deploy
2. Check the logs for any errors
3. Test the health endpoint: `https://your-app.railway.app/health`

## 🔍 Troubleshooting

### Check Environment Variables

```bash
# Run locally to test
node scripts/test-env.js
```

### Common Issues

- **Firebase Error**: Make sure all Firebase variables are set
- **JWT Error**: Set a strong JWT_SECRET
- **CORS Error**: Update ALLOWED_ORIGINS with your frontend domain

## ✅ Success Indicators

- Health check passes: `https://your-app.railway.app/health`
- Application logs show Firebase project connected
- No file system errors related to firebase.json

## 🔒 Security Notes

- Never commit firebase.json to Git
- Use strong JWT_SECRET in production
- Rotate Firebase credentials regularly
- Update ALLOWED_ORIGINS for production
