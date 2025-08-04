<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Shortlink Backend API

Backend API cho ứng dụng quản lý shortlink với Firebase làm database.

## Tính năng

- ✅ **Authentication**: Đăng ký, đăng nhập với JWT
- ✅ **Shortlink Management**: Quản lý shortlink với user ownership
- ✅ **Schedule Management**: Thay đổi target URL theo lịch trình thời gian
- ✅ **Password Protection**: Bảo mật shortlink bằng mật khẩu
- ✅ **Analytics**: Thống kê truy cập, phân tích thiết bị, địa lý
- ✅ **Time-based Access**: Giới hạn thời gian truy cập shortlink
- ✅ **Firebase Integration**: Database với Firebase Firestore
- ✅ **Rate Limiting**: Bảo vệ API khỏi abuse

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd backend
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Firebase

File `firebase.json` đã được cấu hình sẵn với service account credentials. Ứng dụng sẽ tự động sử dụng file này.

**Lưu ý:** File này chứa thông tin nhạy cảm, không nên commit lên git repository.

### 4. Tạo file .env

Tạo file `.env` với nội dung:

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

### 5. Chạy ứng dụng

#### Cách 1: Chạy trực tiếp

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

#### Cách 2: Chạy với Docker (Khuyến nghị)

**Prerequisites:**

- Docker và Docker Compose đã cài đặt
- File `firebase.json` và `.env` đã được cấu hình

**Build Docker images:**

```bash
# Build tất cả images
./docker/build.sh

# Hoặc build thủ công
docker-compose build
```

**Chạy với Docker:**

```bash
# Development mode (port 3000)
./docker/run.sh dev

# Production mode (port 3001)
./docker/run.sh prod

# Hoặc chạy thủ công
docker-compose up backend-dev    # Development
docker-compose up backend-prod   # Production
```

**Dừng services:**

```bash
docker-compose down
```

**Xem logs:**

```bash
docker-compose logs -f backend-dev
docker-compose logs -f backend-prod
```

#### Cách 3: Deploy lên Railway (Production)

**Prerequisites:**

- Railway account: [railway.app](https://railway.app)
- Railway CLI: `npm install -g @railway/cli`
- File `firebase.json` có sẵn

**Setup Railway:**

```bash
# Cài đặt Railway CLI
npm install -g @railway/cli

# Login
railway login

# Tạo project
railway init

# Setup environment variables
node scripts/railway-setup.js
```

**Deploy:**

```bash
# Deploy lên Railway
railway up

# Kiểm tra status
railway status

# Xem logs
railway logs
```

**Chi tiết hướng dẫn:** Xem file `RAILWAY_SETUP.md`

## API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký user
- `POST /auth/login` - Đăng nhập

### Users

- `GET /users/profile` - Lấy thông tin user (cần JWT)
- `PUT /users/profile` - Cập nhật profile (cần JWT)

### Shortlinks

- `POST /shortlinks` - Tạo shortlink (cần JWT)
- `GET /shortlinks` - Lấy danh sách shortlink của user (cần JWT)
- `GET /shortlinks/:id` - Lấy chi tiết shortlink (cần JWT)
- `PUT /shortlinks/:id` - Cập nhật shortlink (cần JWT)
- `DELETE /shortlinks/:id` - Xóa shortlink (cần JWT)
- `GET /shortlinks/s/:code` - Redirect shortlink (public)

### Schedules (Lịch trình)

- `POST /shortlinks/:id/schedules` - Tạo lịch trình (cần JWT)
- `GET /shortlinks/:id/schedules` - Lấy danh sách lịch trình (cần JWT)
- `GET /shortlinks/:id/schedules/:scheduleId` - Lấy chi tiết lịch trình (cần JWT)
- `PUT /shortlinks/:id/schedules/:scheduleId` - Cập nhật lịch trình (cần JWT)
- `DELETE /shortlinks/:id/schedules/:scheduleId` - Xóa lịch trình (cần JWT)

### Password Protection

- `POST /shortlinks/:id/passwords` - Tạo password protection (cần JWT)
- `GET /shortlinks/:id/passwords` - Lấy danh sách password (cần JWT)
- `DELETE /shortlinks/:id/passwords/:passwordId` - Xóa password (cần JWT)
- `POST /shortlinks/:id/passwords/verify` - Verify password (public)
- `GET /shortlinks/:id/passwords/check` - Kiểm tra có password không (public)

### Analytics

- `GET /shortlinks/:id/analytics/overview` - Thống kê tổng quan (cần JWT)
- `GET /shortlinks/:id/analytics/devices` - Thống kê thiết bị (cần JWT)
- `GET /shortlinks/:id/analytics/countries` - Thống kê quốc gia (cần JWT)
- `GET /shortlinks/:id/analytics/timeline?days=30` - Thống kê theo thời gian (cần JWT)

## Cấu trúc Database

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

## Test API

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

## Công nghệ sử dụng

- **Framework:** NestJS
- **Database:** Firebase Firestore
- **Authentication:** JWT + bcrypt
- **Language:** TypeScript
- **Rate Limiting:** @nestjs/throttler

## Bảo mật

- JWT authentication cho tất cả protected routes
- Password hashing với bcrypt
- Rate limiting để tránh abuse
- User ownership cho shortlinks
- Input validation với class-validator

## Development

```bash
# Lint
npm run lint

# Test
npm run test

# Build
npm run build
```
