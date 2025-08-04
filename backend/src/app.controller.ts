import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseService } from './common/services/firebase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('firebase/status')
  getFirebaseStatus() {
    return this.firebaseService.getFirebaseStatus();
  }

  @Get('firebase/test')
  async testFirebaseConnection() {
    try {
      const result = await this.firebaseService.testFirebaseConnection();
      return {
        success: result,
        message: result
          ? 'Firebase connection test passed'
          : 'Firebase connection test failed',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Firebase connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('debug/env')
  getEnvironmentDebug() {
    const envVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'JWT_EXPIRES_IN',
      'BCRYPT_SALT_ROUNDS',
      'SHORTLINK_CODE_LENGTH',
      'THROTTLER_TTL',
      'THROTTLER_LIMIT',
      'DATABASE_PATH',
      'ALLOWED_ORIGINS',
      'FIREBASE_TYPE',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_AUTH_URI',
      'FIREBASE_TOKEN_URI',
      'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
      'FIREBASE_CLIENT_X509_CERT_URL',
      'FIREBASE_UNIVERSE_DOMAIN',
    ];

    const envStatus = {};
    envVars.forEach((varName) => {
      const value = process.env[varName];
      if (value) {
        if (
          varName.includes('SECRET') ||
          varName.includes('KEY') ||
          varName.includes('PRIVATE')
        ) {
          envStatus[varName] = `[HIDDEN] (${value.length} chars)`;
        } else {
          envStatus[varName] = value;
        }
      } else {
        envStatus[varName] = 'MISSING';
      }
    });

    return {
      environment: process.env.NODE_ENV || 'development',
      variables: envStatus,
      firebaseStatus: this.firebaseService.getFirebaseStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}
