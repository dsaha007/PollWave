import { Injectable, inject } from '@angular/core';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private db = getFirestore();
  private authService = inject(AuthService);

  getCategories(): Observable<Category[]> {
    return new Observable<Category[]>(subscriber => {
      const ref = collection(this.db, 'categories');
      const unsubscribe = onSnapshot(ref, snapshot => {
        const categories = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Category));
        subscriber.next(categories);
      }, error => subscriber.error(error));
      return unsubscribe;
    });
  }

  async addCategory(name: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    await addDoc(collection(this.db, 'categories'), {
      name,
      createdAt: new Date(),
      createdBy: user.uid
    });
  }

  async updateCategory(id: string, name: string): Promise<void> {
    await updateDoc(doc(this.db, 'categories', id), { name });
  }

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(this.db, 'categories', id));
  }
}