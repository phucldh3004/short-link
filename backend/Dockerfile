# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18 AS production

RUN groupadd -r -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nestjs && \
    apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Sao chép file build ra
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Firebase config (nếu cần thiết thực sự)
# Nếu không có file firebase.json, Railway sẽ fail ở bước này
# COPY --from=builder --chown=nestjs:nodejs /app/firebase.json ./

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
