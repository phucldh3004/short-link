import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeFirebase } from '../../config/firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore | null = null;
  private isFirebaseAvailable = false;

  onModuleInit() {
    // Check if Firebase config is available
    const hasFirebaseConfig =
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL;

    if (hasFirebaseConfig) {
      try {
        initializeFirebase();
        this.firestore = admin.firestore();
        this.isFirebaseAvailable = true;
        console.log('✅ Firebase service initialized');
      } catch {
        console.log(
          '⚠️  Firebase initialization failed, continuing without Firebase',
        );
        this.isFirebaseAvailable = false;
      }
    } else {
      console.log('⚠️  Firebase not configured, continuing without Firebase');
      this.isFirebaseAvailable = false;
    }
  }

  // Generic CRUD operations
  async create<T>(collection: string, data: T): Promise<string> {
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
    }
    const docRef = await this.firestore.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
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
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
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
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
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
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
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
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
    }
    await this.firestore.collection(collection).doc(id).delete();
  }

  async increment(
    collection: string,
    id: string,
    field: string,
    value: number = 1,
  ): Promise<void> {
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
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
    if (!this.isFirebaseAvailable || !this.firestore) {
      throw new Error('Firebase is not available');
    }
    let query: any = this.firestore.collection(collection);

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
