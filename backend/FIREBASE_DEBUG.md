# Firebase Debug Guide for Railway

## Vấn đề thường gặp

### 1. Missing Firebase Environment Variables

Nếu bạn thấy lỗi:

```
Missing Firebase environment variables: FIREBASE_PRIVATE_KEY_ID
⚠️  Firebase not configured, skipping initialization
```

**Nguyên nhân:**

- Biến môi trường không được thiết lập đúng trên Railway
- Private key format không đúng
- Railway không đọc được biến môi trường

**Cách khắc phục:**

1. **Kiểm tra biến môi trường trên Railway:**

   ```bash
   # Chạy script test
   npm run test:railway
   ```

2. **Đảm bảo tất cả biến Firebase được thiết lập:**
   - `FIREBASE_TYPE`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_CLIENT_ID`
   - `FIREBASE_CLIENT_X509_CERT_URL`

3. **Kiểm tra format của Private Key:**
   - Private key phải có format PEM
   - Phải bắt đầu với `-----BEGIN PRIVATE KEY-----`
   - Phải kết thúc với `-----END PRIVATE KEY-----`

## Scripts Debug

### 1. Test Environment Variables

```bash
npm run test:railway
```

### 2. Test Firebase Configuration

```bash
npm run test:firebase
```

### 3. Build và Test toàn bộ

```bash
npm run build:test
```

## Logging Chi tiết

Ứng dụng sẽ log tất cả biến môi trường khi khởi động:

```
🚀 Starting application...
📋 Environment Variables Check:
✅ NODE_ENV: production
✅ JWT_SECRET: [HIDDEN] (64 chars)
❌ FIREBASE_PRIVATE_KEY_ID: MISSING
...
```

## Cách thiết lập Firebase trên Railway

1. **Tạo Service Account trên Firebase Console:**
   - Vào Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Download file JSON

2. **Thiết lập biến môi trường trên Railway:**
   - Vào Railway Dashboard > Your Project > Variables
   - Thêm từng biến từ file JSON:

   ```
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com
   ```

3. **Lưu ý quan trọng:**
   - Private key phải được escape đúng cách
   - Sử dụng `\n` thay vì xuống dòng thực
   - Đặt private key trong dấu ngoặc kép

## Troubleshooting

### Lỗi "Firebase is not available"

- Kiểm tra xem tất cả biến Firebase đã được thiết lập chưa
- Chạy `npm run test:firebase` để kiểm tra

### Lỗi "Invalid private key format"

- Đảm bảo private key có format PEM đúng
- Kiểm tra escape characters

### Lỗi "Authentication failed"

- Kiểm tra `FIREBASE_CLIENT_EMAIL` có đúng không
- Kiểm tra `FIREBASE_PROJECT_ID` có đúng không

## Monitoring

Sử dụng Railway logs để theo dõi:

```bash
railway logs
```

Tìm kiếm các log:

- `🔍 Checking Firebase environment variables...`
- `✅ Firebase initialized for project:`
- `❌ Missing Firebase environment variables:`
