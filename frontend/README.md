# Shortlink App

Ứng dụng quản lý shortlink với các tính năng nâng cao như time scheduling, password protection, analytics và admin dashboard.

## Tính năng chính

- ✅ Đăng ký, đăng nhập
- ✅ Quản lý shortlink
- ✅ Thay đổi target link không làm thay đổi shortlink
- ✅ Giới hạn thời gian truy cập
- ✅ Thay đổi target link theo khung thời gian
- ✅ Bảo mật bằng mật khẩu (shortlink + timeschedule)
- ✅ Thống kê truy cập chi tiết
- ✅ QR Code cho shortlinks
- ✅ Import/Export dữ liệu
- ✅ Admin dashboard
- ✅ Rate limiting và caching
- ✅ Backup/restore system

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM với SQLite
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **QR Code**: qrcode
- **Caching**: lru-cache

## Cài đặt Local

1. Clone repository:

```bash
git clone <repository-url>
cd shortlinkApp/frontend
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env.local:

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

4. Setup database:

```bash
npx prisma generate
npx prisma db push
```

5. Chạy development server:

```bash
npm run dev
```

## Deployment lên Vercel

### 1. Chuẩn bị

1. Tạo tài khoản Vercel tại [vercel.com](https://vercel.com)
2. Cài đặt Vercel CLI:

```bash
npm i -g vercel
```

### 2. Environment Variables

Trong Vercel Dashboard, thêm các environment variables:

```
DATABASE_URL=your-production-database-url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key
```

### 3. Database Setup

#### Option 1: Vercel Postgres (Recommended)

1. Tạo Vercel Postgres database trong Vercel Dashboard
2. Copy connection string vào `DATABASE_URL`
3. Deploy và chạy migration:

```bash
npx prisma db push
```

#### Option 2: External Database

- Sử dụng PlanetScale, Supabase, hoặc database khác
- Cập nhật `DATABASE_URL` với connection string

### 4. Deploy

#### Method 1: Vercel CLI

```bash
vercel
```

#### Method 2: GitHub Integration

1. Push code lên GitHub
2. Connect repository với Vercel
3. Vercel sẽ tự động deploy khi có push

#### Method 3: Vercel Dashboard

1. Import project từ GitHub
2. Cấu hình environment variables
3. Deploy

### 5. Post-Deployment

1. Chạy database migration:

```bash
npx prisma db push
```

2. Verify deployment:

- Kiểm tra tất cả routes hoạt động
- Test authentication
- Test shortlink creation và redirect

## Cấu trúc Project

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Auth pages
│   ├── dashboard/         # Dashboard page
│   └── admin/             # Admin page
├── components/            # React Components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── analytics/        # Analytics components
│   └── admin/            # Admin components
├── lib/                  # Utilities
│   ├── auth.ts           # Auth configuration
│   ├── cache.ts          # Caching utilities
│   ├── logger.ts         # Logging utilities
│   └── backup.ts         # Backup utilities
└── types/                # TypeScript types
```

## API Endpoints

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET/POST /api/shortlinks` - Quản lý shortlinks
- `GET/POST/PUT/DELETE /api/timeschedules` - Quản lý time schedules
- `GET /api/analytics` - Analytics data
- `POST /api/redirect/[shortcode]` - Redirect shortlink

## Admin Features

- **Overview**: System statistics
- **Logs**: View, filter, export system logs
- **Backup**: Create/restore backups
- **Cache**: Cache management

## Environment Variables

| Variable          | Description                | Required |
| ----------------- | -------------------------- | -------- |
| `DATABASE_URL`    | Database connection string | Yes      |
| `NEXTAUTH_URL`    | Your app URL               | Yes      |
| `NEXTAUTH_SECRET` | Secret key for NextAuth    | Yes      |

## Troubleshooting

### Database Issues

```bash
npx prisma generate
npx prisma db push
```

### Build Issues

```bash
npm run build
```

### Environment Variables

- Kiểm tra tất cả environment variables đã được set
- Restart deployment sau khi thay đổi env vars

## Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Environment variables
2. Database connection
3. Build logs trong Vercel Dashboard
4. Function logs trong Vercel Dashboard

