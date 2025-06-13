import { Injectable, inject } from '@angular/core';
import { 
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Vote } from '../models/vote.model';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private db = getFirestore();

  hasUserVoted(pollId: string, userId: string): Observable<boolean> {
    const votesRef = collection(this.db, 'votes');
    const q = query(votesRef, 
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty),
      catchError(error => {
        console.error('Error checking if user voted:', error);
        return of(false);
      })
    );
  }

  getUserVote(pollId: string, userId: string): Observable<Vote | null> {
    const votesRef = collection(this.db, 'votes');
    const q = query(votesRef, 
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return null;
        }
        
        const doc = snapshot.docs[0];
        const voteData = doc.data() as Vote;
        return {
          ...voteData,
          id: doc.id,
          createdAt: (voteData.createdAt as any).toDate()
        };
      }),
      catchError(error => {
        console.error('Error fetching user vote:', error);
        return of(null);
      })
    );
  }

  getPollVotes(pollId: string): Observable<Vote[]> {
    const votesRef = collection(this.db, 'votes');
    const q = query(votesRef, where('pollId', '==', pollId));

    return new Observable<Vote[]>(subscriber => {
      const unsubscribe = onSnapshot(q, snapshot => {
        const votes: Vote[] = [];
        snapshot.forEach(doc => {
          const voteData = doc.data() as Vote;
          votes.push({
            ...voteData,
            id: doc.id,
            createdAt: (voteData.createdAt as any).toDate()
          });
        });
        subscriber.next(votes);
      }, error => subscriber.error(error));
      return unsubscribe;
    });
  }
}