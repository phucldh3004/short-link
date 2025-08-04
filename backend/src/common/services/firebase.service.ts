import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeFirebase } from '../../config/firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore | null = null;
  private isFirebaseAvailable = false;
  private firebaseApp: admin.app.App | null = null;

  onModuleInit() {
    console.log('🔧 Initializing Firebase Service...');

    // Check if Firebase config is available
    const hasFirebaseConfig =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY_ID;

    if (hasFirebaseConfig) {
      console.log('✅ Firebase configuration detected');
      try {
        initializeFirebase();
        this.firebaseApp = admin.app();
        this.firestore = admin.firestore();
        this.isFirebaseAvailable = true;
        console.log('✅ Firebase service initialized successfully');

        // Test connection
        this.testFirebaseConnection();
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.log(
          '⚠️  Firebase initialization failed, continuing without Firebase',
        );
        this.isFirebaseAvailable = false;
      }
    } else {
      console.log('⚠️  Firebase not configured, continuing without Firebase');
      console.log('Missing variables:', {
        FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY_ID: !!process.env.FIREBASE_PRIVATE_KEY_ID,
      });
      this.isFirebaseAvailable = false;
    }
  }

  // Test Firebase connection
  async testFirebaseConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.log('❌ Firebase is not available for testing');
      return false;
    }

    try {
      console.log('🧪 Testing Firebase connection...');

      // Test Firestore connection
      if (this.firestore) {
        await this.firestore.collection('_test').doc('connection').get();
        console.log('✅ Firestore connection test passed');
      }

      // Test Auth connection
      if (this.firebaseApp) {
        const auth = this.firebaseApp.auth();
        // Try to list users (this will fail if not admin, but will test connection)
        try {
          await auth.listUsers(1);
          console.log('✅ Firebase Auth connection test passed');
        } catch (error: unknown) {
          const errorObj = error as { code?: string; message?: string };
          if (errorObj.code === 'auth/insufficient-permissions') {
            console.log(
              '✅ Firebase Auth connection test passed (expected permission error)',
            );
          } else {
            console.log(
              '⚠️  Firebase Auth connection test: ',
              errorObj.message || 'Unknown error',
            );
          }
        }
      }

      console.log('✅ Firebase connection test completed successfully');
      return true;
    } catch (error: unknown) {
      const errorObj = error as { message?: string };
      console.error(
        '❌ Firebase connection test failed:',
        errorObj.message || 'Unknown error',
      );
      return false;
    }
  }

  // Get Firebase status
  getFirebaseStatus() {
    return {
      isAvailable: this.isAvailable(),
      isFirebaseAvailable: this.isFirebaseAvailable,
      hasFirestore: !!this.firestore,
      hasFirebaseApp: !!this.firebaseApp,
      projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'NOT SET',
      privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || 'NOT SET',
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    };
  }

  // Check if Firebase is available
  isAvailable(): boolean {
    return this.isFirebaseAvailable && this.firestore !== null;
  }

  // Generic CRUD operations
  async create<T>(collection: string, data: T): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    const docRef = await this.firestore.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    const doc = await this.firestore.collection(collection).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as T;
  }

  async findWhere<T>(
    collection: string,
    field: string,
    value: any,
  ): Promise<T[]> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    const snapshot = await this.firestore
      .collection(collection)
      .where(field, '==', value)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  async findAll<T>(collection: string): Promise<T[]> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    const snapshot = await this.firestore.collection(collection).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  async update<T>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    await this.firestore
      .collection(collection)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  }

  async delete(collection: string, id: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    await this.firestore.collection(collection).doc(id).delete();
  }

  async increment(
    collection: string,
    id: string,
    field: string,
    value: number = 1,
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    await this.firestore
      .collection(collection)
      .doc(id)
      .update({
        [field]: admin.firestore.FieldValue.increment(value),
        updatedAt: new Date(),
      });
  }

  // Query with multiple conditions
  async findWhereMultiple<T>(
    collection: string,
    conditions: Array<{ field: string; operator: any; value: any }>,
  ): Promise<T[]> {
    if (!this.isAvailable()) {
      throw new Error('Firebase is not available');
    }
    if (!this.firestore) {
      throw new Error('Firestore is not initialized');
    }
    let query: admin.firestore.Query = this.firestore.collection(collection);

    conditions.forEach(({ field, operator, value }) => {
      query = query.where(field, operator, value);
    });

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }
}
