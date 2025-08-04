import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeFirebase } from '../../config/firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore | null = null;
  private isFirebaseAvailable = false;

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
        this.firestore = admin.firestore();
        this.isFirebaseAvailable = true;
        console.log('✅ Firebase service initialized successfully');
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
