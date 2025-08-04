# 🐳 Docker Setup Guide

Hướng dẫn setup và chạy backend với Docker.

## 📋 Prerequisites

- Docker Desktop đã cài đặt và đang chạy
- File `firebase.json` đã được cấu hình
- File `.env` đã được tạo với các biến môi trường

## 🚀 Quick Start

### 1. Build Docker Images

```bash
# Build tất cả images
./docker/build.sh

# Hoặc build thủ công
docker-compose build
```

### 2. Chạy với Docker

```bash
# Development mode (port 3001)
./docker/run.sh dev

# Production mode (port 3001)
./docker/run.sh prod

# Hoặc chạy thủ công
docker-compose up backend-dev    # Development
docker-compose up backend-prod   # Production
```

### 3. Dừng Services

```bash
docker-compose down
```

## 📁 File Structure

```
backend/
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore             # Files to exclude from build
├── .env                      # Environment variables
├── firebase.json             # Firebase service account
├── docker/
│   ├── build.sh              # Build script
│   └── run.sh                # Run script
└── README.md                 # Updated with Docker instructions
```

## 🔧 Configuration

### Dockerfile Features

- **Multi-stage build**: Tối ưu image size
- **Alpine Linux**: Lightweight base image
- **Non-root user**: Security best practice
- **Health check**: Monitor application status
- **Production ready**: Optimized for production

### Docker Compose Services

#### Development Service (`backend-dev`)

- **Port**: 3001:3001
- **Volumes**: Source code mounted for hot reload
- **Command**: `npm run start:dev`
- **Environment**: Development mode

#### Production Service (`backend-prod`)

- **Port**: 3001:3001
- **Optimized**: Production build
- **Command**: `node dist/main.js`
- **Environment**: Production mode

## 🛠️ Troubleshooting

### Permission Errors

Nếu gặp lỗi permission với Docker:

```bash
# Fix Docker permissions
sudo chown -R $USER:$USER ~/.docker

# Restart Docker Desktop
# Hoặc restart Docker service
sudo systemctl restart docker
```

### Build Errors

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

### Port Conflicts

Nếu port 3001 đã được sử dụng:

```bash
# Check what's using the port
lsof -i :3001
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

## 📊 Monitoring

### View Logs

```bash
# Development logs
docker-compose logs -f backend-dev

# Production logs
docker-compose logs -f backend-prod

# All services logs
docker-compose logs -f
```

### Container Status

```bash
# List running containers
docker-compose ps

# Container details
docker-compose exec backend-dev sh
```

### Health Check

```bash
# Check if application is responding
curl http://localhost:3001/health
```

## 🔒 Security

### Environment Variables

- `.env` file được mount vào container
- Sensitive data không được commit lên git
- Production secrets nên được quản lý bởi Docker secrets hoặc external vault

### Network Security

- Containers chạy trong isolated network
- Port mapping chỉ expose cần thiết
- Non-root user trong container

## 🚀 Deployment

### Production Deployment

```bash
# Build production image
docker-compose build backend-prod

# Run production container
docker-compose up -d backend-prod

# Scale if needed
docker-compose up -d --scale backend-prod=3
```

### Environment Variables for Production

Tạo file `.env.production`:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
SHORTLINK_CODE_LENGTH=6
THROTTLER_TTL=60
THROTTLER_LIMIT=100
DATABASE_PATH=shortlink.db
ALLOWED_ORIGINS=*
```

## 📝 Useful Commands

```bash
# Build specific service
docker-compose build backend-dev

# Run in detached mode
docker-compose up -d backend-dev

# View container resources
docker stats

# Clean up unused resources
docker system prune

# View image layers
docker history shortlink-backend-dev
```

## 🧪 Testing

### Test Docker Setup

```bash
# Run test script
node test-docker.js
```

### Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API endpoints
node test-api.js
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment)
