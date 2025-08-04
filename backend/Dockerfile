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

# Firebase config - tạo firebase.json từ environment variables
RUN echo '{"type":"service_account","project_id":"'$FIREBASE_PROJECT_ID'","private_key_id":"'$FIREBASE_PRIVATE_KEY_ID'","private_key":"'$FIREBASE_PRIVATE_KEY'","client_email":"'$FIREBASE_CLIENT_EMAIL'","client_id":"'$FIREBASE_CLIENT_ID'","auth_uri":"'$FIREBASE_AUTH_URI'","token_uri":"'$FIREBASE_TOKEN_URI'","auth_provider_x509_cert_url":"'$FIREBASE_AUTH_PROVIDER_X509_CERT_URL'","client_x509_cert_url":"'$FIREBASE_CLIENT_X509_CERT_URL'","universe_domain":"'$FIREBASE_UNIVERSE_DOMAIN'"}' > firebase.json

USER nestjs

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

CMD ["node", "dist/main.js"]
