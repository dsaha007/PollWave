import { Injectable } from '@angular/core';
import { getFirestore, collection, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private db = getFirestore();

  getAllUsers(): Observable<User[]> {
    return new Observable<User[]>(subscriber => {
      const ref = collection(this.db, 'users');
      const unsubscribe = onSnapshot(ref, snapshot => {
        const users = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          uid: docSnap.id
        } as User));
        subscriber.next(users);
      }, error => subscriber.error(error));
      return unsubscribe;
    });
  }

  async setUserBanned(uid: string, banned: boolean): Promise<void> {
    await updateDoc(doc(this.db, 'users', uid), { banned });
  }
}