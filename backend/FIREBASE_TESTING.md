# Firebase Testing Guide

## Các công cụ test Firebase

### 1. Test Environment Variables

```bash
npm run test:railway
```

Kiểm tra tất cả biến môi trường cần thiết cho Firebase.

### 2. Test Firebase Configuration

```bash
npm run test:firebase
```

Kiểm tra cấu hình Firebase và format của private key.

### 3. Test Firebase Connection (Requires running app)

```bash
npm run test:firebase-connection
```

Test kết nối Firebase thông qua HTTP endpoints.

### 4. Test Production Startup

```bash
npm run test:production
```

Test ứng dụng production với Firebase.

## HTTP Endpoints để Debug Firebase

### 1. Health Check

```
GET /health
```

Kiểm tra ứng dụng có hoạt động không.

### 2. Environment Debug

```
GET /debug/env
```

Hiển thị tất cả biến môi trường và trạng thái Firebase.

### 3. Firebase Status

```
GET /firebase/status
```

Hiển thị trạng thái chi tiết của Firebase service.

### 4. Firebase Connection Test

```
GET /firebase/test
```

Test kết nối Firebase và trả về kết quả.

## Logs chi tiết

### Startup Logs

Khi ứng dụng khởi động, bạn sẽ thấy:

```
🚀 Starting application...
📋 Environment Variables Check:
✅ NODE_ENV: production
✅ JWT_SECRET: [HIDDEN] (64 chars)
❌ FIREBASE_PRIVATE_KEY_ID: MISSING
...
```

### Firebase Service Logs

```
🔧 Initializing Firebase Service...
✅ Firebase configuration detected
🧪 Testing Firebase connection...
✅ Firestore connection test passed
✅ Firebase Auth connection test passed (expected permission error)
✅ Firebase connection test completed successfully
```

## Cách debug trên Railway

### 1. Kiểm tra logs

```bash
railway logs
```

### 2. Test endpoints trên Railway

```bash
# Thay YOUR_RAILWAY_URL bằng URL thực của bạn
curl https://YOUR_RAILWAY_URL/health
curl https://YOUR_RAILWAY_URL/debug/env
curl https://YOUR_RAILWAY_URL/firebase/status
curl https://YOUR_RAILWAY_URL/firebase/test
```

### 3. Test với script

```bash
BASE_URL=https://YOUR_RAILWAY_URL npm run test:firebase-connection
```

## Troubleshooting

### Lỗi "Firebase is not available"

- Kiểm tra biến môi trường: `npm run test:railway`
- Kiểm tra cấu hình: `npm run test:firebase`

### Lỗi "Firebase connection test failed"

- Kiểm tra service account permissions
- Kiểm tra project ID và client email
- Kiểm tra private key format

### Lỗi "Missing Firebase environment variables"

- Đảm bảo tất cả biến Firebase được thiết lập trên Railway
- Kiểm tra format của private key
- Đảm bảo không có khoảng trắng thừa

## Ví dụ Response

### `/debug/env`

```json
{
  "environment": "production",
  "variables": {
    "NODE_ENV": "production",
    "JWT_SECRET": "[HIDDEN] (64 chars)",
    "FIREBASE_PRIVATE_KEY_ID": "MISSING",
    "FIREBASE_PROJECT_ID": "short-link-app-51580"
  },
  "firebaseStatus": {
    "isAvailable": false,
    "isFirebaseAvailable": false,
    "hasFirestore": false,
    "hasFirebaseApp": false,
    "projectId": "short-link-app-51580",
    "clientEmail": "firebase-adminsdk-fbsvc@short-link-app-51580.iam.gserviceaccount.com",
    "privateKeyId": "NOT SET",
    "hasPrivateKey": true
  }
}
```

### `/firebase/test`

```json
{
  "success": true,
  "message": "Firebase connection test passed",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Tips

1. **Luôn kiểm tra logs khi deploy lên Railway**
2. **Sử dụng `/debug/env` để xem trạng thái biến môi trường**
3. **Sử dụng `/firebase/test` để test kết nối thực tế**
4. **Kiểm tra private key format trước khi deploy**
5. **Đảm bảo service account có đủ permissions**
