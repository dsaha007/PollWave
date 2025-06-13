import { Injectable, inject } from '@angular/core';
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Report } from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private db = getFirestore();
  private authService = inject(AuthService);

  async reportPoll(pollId: string, reason: string): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) throw new Error('You must be logged in to report.');
    const q = query(collection(this.db, 'reports'), where('pollId', '==', pollId), where('reportedBy', '==', user.uid));
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('You have already reported this poll.');
    await addDoc(collection(this.db, 'reports'), {
      pollId,
      reportedBy: user.uid,
      reason,
      createdAt: new Date()
    });
  }

  getReports(): Observable<Report[]> {
    return new Observable<Report[]>(subscriber => {
      const ref = collection(this.db, 'reports');
      const unsubscribe = onSnapshot(ref, snapshot => {
        const reports = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Report));
        subscriber.next(reports);
      }, error => subscriber.error(error));
      return unsubscribe;
    });
  }

  getReportsForPoll(pollId: string): Observable<Report[]> {
    return new Observable<Report[]>(subscriber => {
      const q = query(collection(this.db, 'reports'), where('pollId', '==', pollId));
      const unsubscribe = onSnapshot(q, snapshot => {
        const reports = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Report));
        subscriber.next(reports);
      }, error => subscriber.error(error));
      return unsubscribe;
    });
  }
}