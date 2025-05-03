import { Injectable, inject } from '@angular/core';
import { 
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { Poll, PollOption } from '../models/poll.model';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private db = getFirestore();
  private authService = inject(AuthService);
  private latestPollsSubject = new BehaviorSubject<Poll[]>([]);
  latestPolls$ = this.latestPollsSubject.asObservable();

  constructor() {
    this.listenToLatestPolls();
  }

  private listenToLatestPolls(): void {
    const pollsRef = collection(this.db, 'polls');
    const q = query(pollsRef, orderBy('createdAt', 'desc'), limit(10));
    
    onSnapshot(q, (snapshot) => {
      const polls: Poll[] = [];
      snapshot.forEach(doc => {
        const pollData = doc.data() as Poll;
        polls.push({
          ...pollData,
          id: doc.id,
          createdAt: (pollData.createdAt as any).toDate()
        });
      });
      this.latestPollsSubject.next(polls);
    });
  }

  async createPoll(question: string, options: string[]): Promise<string> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to create a poll');
      }

      const pollOptions: PollOption[] = options.map(text => ({
        id: uuidv4(),
        text,
        votes: 0
      }));

      const pollData: Omit<Poll, 'id'> = {
        question,
        options: pollOptions,
        createdBy: user.uid,
        createdAt: new Date(),
        isActive: true,
        totalVotes: 0
      };

      const docRef = await addDoc(collection(this.db, 'polls'), pollData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  }

  getPoll(id: string): Observable<Poll | null> {
    return from(getDoc(doc(this.db, 'polls', id))).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Poll;
          return {
            ...data,
            id: docSnap.id,
            createdAt: (data.createdAt as any).toDate()
          };
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error('Error fetching poll:', error);
        return of(null);
      })
    );
  }

  getPolls(): Observable<Poll[]> {
    const pollsRef = collection(this.db, 'polls');
    const q = query(pollsRef, orderBy('createdAt', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const polls: Poll[] = [];
        snapshot.forEach(doc => {
          const pollData = doc.data() as Poll;
          polls.push({
            ...pollData,
            id: doc.id,
            createdAt: (pollData.createdAt as any).toDate()
          });
        });
        return polls;
      }),
      catchError(error => {
        console.error('Error fetching polls:', error);
        return of([]);
      })
    );
  }

  getUserPolls(userId: string): Observable<Poll[]> {
    const pollsRef = collection(this.db, 'polls');
    const q = query(pollsRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        const polls: Poll[] = [];
        snapshot.forEach(doc => {
          const pollData = doc.data() as Poll;
          polls.push({
            ...pollData,
            id: doc.id,
            createdAt: (pollData.createdAt as any).toDate()
          });
        });
        return polls;
      }),
      catchError(error => {
        console.error('Error fetching user polls:', error);
        return of([]);
      })
    );
  }

  async vote(pollId: string, optionId: string): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated to vote');
      }
      
      const votesRef = collection(this.db, 'votes');
      const q = query(votesRef, 
        where('pollId', '==', pollId),
        where('userId', '==', user.uid)
      );
      
      const voteSnap = await getDocs(q);
      if (!voteSnap.empty) {
        throw new Error('User has already voted on this poll');
      }
      
      const pollRef = doc(this.db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      
      if (!pollSnap.exists()) {
        throw new Error('Poll not found');
      }
      
      const pollData = pollSnap.data() as Poll;
      if (!pollData.isActive) {
        throw new Error('This poll is no longer active');
      }
      
      const optionIndex = pollData.options.findIndex(opt => opt.id === optionId);
      if (optionIndex === -1) {
        throw new Error('Option not found');
      }
      
      const updatedOptions = [...pollData.options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        votes: updatedOptions[optionIndex].votes + 1
      };
      
      await updateDoc(pollRef, {
        options: updatedOptions,
        totalVotes: (pollData.totalVotes || 0) + 1
      });
      
      await addDoc(collection(this.db, 'votes'), {
        pollId,
        optionId,
        userId: user.uid,
        userDisplayName: user.displayName,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  }

  async togglePollStatus(pollId: string): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      const pollRef = doc(this.db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      
      if (!pollSnap.exists()) {
        throw new Error('Poll not found');
      }
      
      const pollData = pollSnap.data() as Poll;
      
      if (pollData.createdBy !== user.uid) {
        throw new Error('Only the poll creator can change its status');
      }
      
      await updateDoc(pollRef, {
        isActive: !pollData.isActive
      });
    } catch (error) {
      console.error('Error toggling poll status:', error);
      throw error;
    }
  }

  async deletePoll(pollId: string): Promise<void> {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }
      
      const pollRef = doc(this.db, 'polls', pollId);
      const pollSnap = await getDoc(pollRef);
      
      if (!pollSnap.exists()) {
        throw new Error('Poll not found');
      }
      
      const pollData = pollSnap.data() as Poll;
      
      if (pollData.createdBy !== user.uid) {
        throw new Error('Only the poll creator can delete it');
      }
      
      await deleteDoc(pollRef);
      
      const votesRef = collection(this.db, 'votes');
      const q = query(votesRef, where('pollId', '==', pollId));
      const votesSnap = await getDocs(q);
      
      const deletePromises: Promise<void>[] = [];
      votesSnap.forEach(doc => {
        deletePromises.push(deleteDoc(doc.ref));
      });
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  }
}