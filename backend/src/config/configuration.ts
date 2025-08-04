export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    type: 'sqlite',
    database: process.env.DATABASE_PATH || 'shortlink.db',
    synchronize: process.env.NODE_ENV !== 'production',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
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
});
