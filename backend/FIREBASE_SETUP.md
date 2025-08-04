# Cấu hình Firebase

## 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới
3. Bật Firestore Database
4. Tạo service account key

## 2. Cấu hình Firebase

### Sử dụng file firebase.json (Đã có sẵn)

File `firebase.json` đã được cấu hình sẵn với service account credentials. Ứng dụng sẽ tự động sử dụng file này.

### Tạo file .env cho các cấu hình khác

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# Shortlink Configuration
SHORTLINK_CODE_LENGTH=6

# Rate Limiting
THROTTLER_TTL=60
THROTTLER_LIMIT=100

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000
```

## 3. Cấu hình Service Account

File `firebase.json` đã chứa service account credentials. Không cần cấu hình thêm.

**Lưu ý:** File này chứa thông tin nhạy cảm, không nên commit lên git repository. Trong production, nên sử dụng biến môi trường hoặc secret management.

## 4. Cấu hình Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Shortlinks collection
    match /shortlinks/{shortlinkId} {
      allow read: if true; // Allow public read for redirects
      allow write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 5. Cấu trúc Database

### Collections:

1. **users**
   - id: string (auto-generated)
   - email: string
   - password: string (hashed)
   - name: string
   - createdAt: timestamp
   - updatedAt: timestamp

2. **shortlinks**
   - id: string (auto-generated)
   - code: string (unique)
   - targetUrl: string
   - clicks: number
   - isActive: boolean
   - expiresAt: timestamp (optional)
   - userId: string
   - createdAt: timestamp
   - updatedAt: timestamp

## 6. Chạy ứng dụng

```bash
npm run start:dev
```

## 7. Test API

### Đăng ký

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Đăng nhập

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Tạo shortlink

```bash
curl -X POST http://localhost:3000/shortlinks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "targetUrl": "https://example.com"
  }'
```
