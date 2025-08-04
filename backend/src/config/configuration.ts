export default () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Validate required environment variables in production
  if (isProduction) {
    const requiredVars = [
      'JWT_SECRET',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
    ];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missingVars.join(', ')}`,
      );
    }
  }

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    database: {
      type: 'sqlite',
      database: process.env.DATABASE_PATH || 'shortlink.db',
      synchronize: !isProduction, // Only sync in development
    },
    jwt: {
      secret:
        process.env.JWT_SECRET ||
        (isProduction ? undefined : 'your-secret-key'),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    },
    shortlink: {
      codeLength: parseInt(process.env.SHORTLINK_CODE_LENGTH || '6', 10),
    },
    throttler: {
      ttl: parseInt(process.env.THROTTLER_TTL || '60', 10),
      limit: parseInt(process.env.THROTTLER_LIMIT || '100', 10),
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      isConfigured: !!(
        process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY
      ),
    },
    cors: {
      origins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3001',
        'http://127.0.0.1:3001',
      ],
    },
  };
};
