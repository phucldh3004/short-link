import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { initializeFirebase } from '../../config/firebase.config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: admin.firestore.Firestore;

  onModuleInit() {
    initializeFirebase();
    this.firestore = admin.firestore();
  }

  // Generic CRUD operations
  async create<T>(collection: string, data: T): Promise<string> {
    const docRef = await this.firestore.collection(collection).add({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  }

  async findById<T>(collection: string, id: string): Promise<T | null> {
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
    await this.firestore
      .collection(collection)
      .doc(id)
      .update({
        ...data,
        updatedAt: new Date(),
      });
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.firestore.collection(collection).doc(id).delete();
  }

  async increment(
    collection: string,
    id: string,
    field: string,
    value: number = 1,
  ): Promise<void> {
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
