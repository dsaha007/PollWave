import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollService } from '../../services/poll.service';
import { VoteService } from '../../services/vote.service';
import { Poll } from '../../models/poll.model';
import { Chart, registerables } from 'chart.js';
import { collection, getFirestore, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Poll Analytics</h2>
        <div *ngIf="isLoading" class="spinner"></div>
        <div *ngIf="!isLoading">
          <div class="analytics-grid">
            <div class="analytics-card">
              <h3>Total Polls</h3>
              <p>{{ totalPolls }}</p>
            </div>
            <div class="analytics-card">
              <h3>Total Votes</h3>
              <p>{{ totalVotes }}</p>
            </div>
            <div class="analytics-card">
              <h3>Active Polls</h3>
              <p>{{ activePolls }}</p>
            </div>
            <div class="analytics-card">
              <h3>Closed Polls</h3>
              <p>{{ closedPolls }}</p>
            </div>
          </div>
          <div class="chart-section">
            <h3>Votes per Category</h3>
            <canvas id="votesCategoryChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-grid {
      display: flex;
      gap: 24px;
      margin-bottom: 40px;
      flex-wrap: wrap;
    }
    .analytics-card {
      background: #f9f9f9;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 24px;
      flex: 1 1 200px;
      min-width: 200px;
      text-align: center;
    }
    .analytics-card h3 {
      color: var(--primary-color);
      margin-bottom: 10px;
    }
    .analytics-card p {
      font-size: 2rem;
      font-weight: bold;
      color: var(--accent-color);
    }
    .chart-section {
      margin-top: 40px;
    }
  `]
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  private pollService = inject(PollService);
  private voteService = inject(VoteService);
  private db = getFirestore();

  isLoading = true;
  totalPolls = 0;
  totalVotes = 0;
  activePolls = 0;
  closedPolls = 0;
  votesPerCategory: { [category: string]: number } = {};
  private chartInstance: Chart | null = null;
  private unsubscribe: (() => void) | null = null;

  ngOnInit() {
    this.listenToPollsRealtime();
  }

  ngOnDestroy() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.chartInstance) this.chartInstance.destroy();
  }

  listenToPollsRealtime() {
    this.isLoading = true;
    const pollsRef = collection(this.db, 'polls');
    this.unsubscribe = onSnapshot(pollsRef, (snapshot: QuerySnapshot<DocumentData>) => {
      const polls: Poll[] = [];
      snapshot.forEach(doc => {
        const pollData = doc.data() as Poll;
        polls.push({
          ...pollData,
          id: doc.id,
          createdAt: (pollData.createdAt as any).toDate()
        });
      });

      this.totalPolls = polls.length;
      this.activePolls = polls.filter(p => p.isActive).length;
      this.closedPolls = polls.filter(p => !p.isActive).length;

      // Calculate votes per category and total votes
      this.votesPerCategory = {};
      this.totalVotes = 0;
      for (const poll of polls) {
        const cat = poll.category || 'Uncategorized';
        this.votesPerCategory[cat] = (this.votesPerCategory[cat] || 0) + (poll.totalVotes || 0);
        this.totalVotes += poll.totalVotes || 0;
      }

      setTimeout(() => this.renderVotesCategoryChart(), 0);
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      console.error('Error listening to polls:', error);
    });
  }

  renderVotesCategoryChart() {
    const ctx = (document.getElementById('votesCategoryChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;
    const categories = Object.keys(this.votesPerCategory);
    const votes = Object.values(this.votesPerCategory);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Votes',
          data: votes,
          backgroundColor: '#EC6408'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}