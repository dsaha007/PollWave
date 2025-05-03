import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import { PollService } from '../../../services/poll.service';
import { VoteService } from '../../../services/vote.service';
import { Poll, PollOption } from '../../../models/poll.model';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      @if (isLoading) {
        <div class="spinner"></div>
      } @else if (!poll) {
        <div class="poll-not-found">
          <h2>Poll Not Found</h2>
          <p>The poll you're looking for doesn't exist or has been removed.</p>
          <a routerLink="/polls" class="btn btn-primary">Browse Polls</a>
        </div>
      } @else {
        <div class="poll-details-container">
          <div class="poll-header">
            <h1>{{ poll.question }}</h1>
            <div class="poll-meta">
              <span class="poll-votes">{{ poll.totalVotes || 0 }} votes</span>
              <span class="poll-status" [class.active]="poll.isActive">
                {{ poll.isActive ? 'Active' : 'Closed' }}
              </span>
            </div>
          </div>
          
          @if (errorMessage) {
            <div class="alert alert-danger">
              {{ errorMessage }}
            </div>
          }
          
          @if (successMessage) {
            <div class="alert alert-success">
              {{ successMessage }}
            </div>
          }
          
          <div class="poll-content">
            <div class="voting-section" *ngIf="poll.isActive && !hasVoted && currentUser">
              <h2>Cast Your Vote</h2>
              <div class="options-list">
                @for (option of poll.options; track option.id) {
                  <div 
                    class="option-item" 
                    [class.selected]="selectedOptionId === option.id"
                    (click)="selectOption(option.id)"
                  >
                    <span class="option-text">{{ option.text }}</span>
                    <span class="option-check" *ngIf="selectedOptionId === option.id">✓</span>
                  </div>
                }
              </div>
              
              <div class="voting-actions">
                <button 
                  class="btn btn-accent" 
                  [disabled]="!selectedOptionId || isVoting" 
                  (click)="submitVote()"
                >
                  @if (isVoting) {
                    <span>Submitting...</span>
                  } @else {
                    <span>Submit Vote</span>
                  }
                </button>
              </div>
            </div>
            
            @if (!poll.isActive) {
              <div class="poll-closed-banner">
                <p>This poll is now closed. No more votes can be cast.</p>
              </div>
            }
            
            @if (!currentUser) {
              <div class="login-to-vote">
                <p>Please <a routerLink="/login">log in</a> to vote on this poll.</p>
              </div>
            }
            
            @if (hasVoted) {
              <div class="already-voted">
                <p>You've already voted on this poll.</p>
                @if (userVoteOption) {
                  <p>You voted for: <strong>{{ userVoteOption.text }}</strong></p>
                }
              </div>
            }
            
            <div class="results-section">
              <h2>Results</h2>
              <div class="chart-container">
                <canvas id="resultsChart"></canvas>
              </div>
              
              <div class="results-table">
                <div *ngFor="let option of poll?.options; let index = index" class="result-row">
                  <div class="result-text">{{ option.text }}</div>
                  <div class="result-bar-container">
                    <div 
                      class="result-bar" 
                      [style.width.%]="getPercentage(option)"
                      [style.background-color]="getBarColor(index)"
                    ></div>
                    <div class="result-percentage">{{ getPercentage(option) }}%</div>
                  </div>
                  <div class="result-votes">{{ option.votes }} vote{{ option.votes !== 1 ? 's' : '' }}</div>
                  <div class="result-voters">
                    <strong>Voters:</strong>
                    <div class="voter-grid">
                        <div 
                          *ngFor="let voter of option.voters; let index = index" 
                          class="voter-avatar" 
                          [style.background-color]="getBarColor(index)"
                          [title]="voter" 
                          (click)="showFullName(voter)" 
                        >
                        <span class="voter-initial">{{ voter.charAt(0).toUpperCase() }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          <div *ngIf="selectedVoter" class="modal-overlay">
            <div class="modal">
              <p>Voter: {{ selectedVoter }}</p>
              <button class="btn btn-close" (click)="closeFullName()">Close</button>
            </div>
          </div>

          <div class="poll-actions">
            <a routerLink="/polls" class="btn btn-outline">Back to Polls</a>
            
            @if (isCreator && poll) {
              <button 
                class="btn" 
                [class]="poll.isActive ? 'btn-outline' : 'btn-accent'"
                (click)="togglePollStatus()"
                [disabled]="isToggling"
              >f
                {{ poll.isActive ? 'Close Poll' : 'Reopen Poll' }}
              </button>
              
              <button 
                class="btn btn-outline danger"
                (click)="confirmDeletePoll()"
                [disabled]="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Poll' }}
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .voter-list {
      display: flex;
      list-style-type: none; 
      padding: 0;
      margin: 0; 
    }

    .inline-block {
        margin-right: 10px; 
    }

    .poll-details-container {
      max-width: 800px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
    }
    
    .poll-header {
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 20px;
    }
    
    .poll-header h1 {
      color: var(--primary-color);
      font-size: 1.8rem;
      margin-bottom: 16px;
    }
    
    .poll-meta {
      display: flex;
      gap: 16px;
    }
    
    .poll-status {
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 500;
      background-color: #ccc;
      color: #333;
    }
    
    .poll-status.active {
      background-color: var(--success-color);
      color: white;
    }
    
    .poll-content {
      margin-bottom: 30px;
    }
    
    .voting-section {
      margin-bottom: 30px;
    }
    
    .voting-section h2,
    .results-section h2 {
      font-size: 1.4rem;
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    
    .options-list {
      margin-bottom: 20px;
    }
    
    .option-item {
      padding: 12px 16px;
      border: 2px solid #ddd;
      border-radius: var(--border-radius);
      margin-bottom: 10px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s ease;
    }
    
    .option-item:hover {
      border-color: var(--primary-color);
      background-color: rgba(0, 51, 102, 0.05);
    }
    
    .option-item.selected {
      border-color: var(--primary-color);
      background-color: rgba(0, 51, 102, 0.1);
    }
    
    .option-check {
      color: var(--primary-color);
      font-weight: bold;
    }
    
    .voting-actions {
      display: flex;
      justify-content: center;
    }
    
    .chart-container {
      height: 300px;
      margin-bottom: 30px;
    }
    
    .results-table {
      margin-bottom: 20px;
    }
    
    .result-row {
      margin-bottom: 12px;
    }
    
    .result-text {
      margin-bottom: 5px;
      font-weight: 500;
    }
    
    .result-bar-container {
      display: flex;
      align-items: center;
      background-color: #f0f0f0;
      border-radius: 4px;
      height: 24px;
      position: relative;
      overflow: hidden;
      margin-bottom: 5px;
    }
    
    .result-bar {
      height: 100%;
      min-width: 20px;
      background-color: var(--primary-color);
      border-radius: 4px;
      transition: width 0.5s ease-out;
    }
    
    .result-percentage {
      position: absolute;
      right: 10px;
      color: #333;
      font-weight: 500;
      font-size: 0.9rem;
    }
    
    .result-votes {
      font-size: 0.9rem;
      color: #666;
    }
    
    .poll-closed-banner,
    .login-to-vote,
    .already-voted {
      background-color: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .poll-closed-banner {
      border-left: 4px solid #dc3545;
    }
    
    .login-to-vote {
      border-left: 4px solid var(--primary-color);
    }
    
    .already-voted {
      border-left: 4px solid var(--accent-color);
    }
    
    .poll-actions {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    
    .danger {
      color: var(--danger-color);
      border-color: var(--danger-color);
    }
    
    .danger:hover {
      background-color: var(--danger-color);
      color: white;
    }
    
    .poll-not-found {
      text-align: center;
      padding: 60px 0;
    }
    
    .poll-not-found h2 {
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    
    .poll-not-found p {
      font-size: 1.1rem;
      margin-bottom: 24px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .poll-details-container {
        padding: 20px;
      }
      
      .poll-actions {
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .poll-actions .btn {
        flex: 1 0 auto;
      }
    }

    .result-voters {
      margin-top: 10px;
      font-size: 0.9rem;
      color: #555;
    }

    .voter-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 0;
      margin: 8px 0 0;
      list-style: none;
    }

    .voter-item {
      background-color: #f0f0f0;
      border-radius: 12px;
      padding: 6px 12px;
      font-size: 0.85rem;
      color: #333;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .voter-name {
      font-weight: 500;
    }

    .voter-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .voter-avatar {
      width: 32px;
      height: 32px;
      background-color: #f0f0f0;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: bold;
      color: #333;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }

    .voter-initial {
      text-transform: uppercase;
      color : white;
    }

    .voter-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: bold;
      color: white; 
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer; 
      transition: transform 0.2s ease;
    }

    .voter-avatar:hover {
      transform: scale(1.1); 
    }

    .voter-full-name {
      margin-top: 10px;
      padding: 10px;
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    
    .modal p {
      margin-bottom: 20px;
      font-size: 1.2rem;
      color: #333;
    }
    
    .btn-close {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
    }
    
    .btn-close:hover {
      background-color: #c82333;
    }
  `]
})
export class PollDetailsComponent implements OnInit, OnDestroy {
  pollId: string | null = null;
  poll: Poll | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  selectedOptionId = '';
  isVoting = false;
  isToggling = false;
  isDeleting = false;
  hasVoted = false;
  userVoteOption: PollOption | null = null;
  isCreator = false;
  chartInstance: Chart | null = null;
  selectedVoter: string | null = null; 

  showFullName(voter: string): void {
    this.selectedVoter = voter;
  }
  closeFullName(): void {
    this.selectedVoter = null;
  }

  private pollSub: Subscription | null = null;
  private userSub: Subscription | null = null;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private pollService = inject(PollService);
  private voteService = inject(VoteService);
  
  get currentUser() {
    return this.authService.getCurrentUser();
  }
  
  ngOnInit(): void {
    this.pollId = this.route.snapshot.paramMap.get('id');
    
    if (this.pollId) {
      this.loadPoll();
      
      this.userSub = this.authService.user$.subscribe(user => {
        if (user && this.poll) {
          this.isCreator = user.uid === this.poll.createdBy;
          this.checkUserVote();
        }
      });
    } else {
      this.isLoading = false;
    }
  }
  
  ngOnDestroy(): void {
    if (this.pollSub) {
      this.pollSub.unsubscribe();
    }
    
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
  
  private loadPoll(): void {
    if (!this.pollId) return;

    this.pollSub = this.pollService.getPoll(this.pollId).subscribe({
      next: (poll) => {
        this.poll = poll;
        this.isLoading = false;

        if (poll) {
          this.isCreator = this.currentUser?.uid === poll.createdBy;
          this.checkUserVote();
          this.fetchVotes(); // Fetch voter information
          setTimeout(() => {
            this.renderChart();
          }, 0);
        }
      },
      error: (error) => {
        console.error('Error loading poll:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load poll details.';
      }
    });
  }
  
  private checkUserVote(): void {
    if (!this.pollId || !this.currentUser || !this.poll) return;
    
    this.voteService.hasUserVoted(this.pollId, this.currentUser.uid).subscribe({
      next: (hasVoted) => {
        this.hasVoted = hasVoted;
        
        if (hasVoted) {
          this.getAndDisplayUserVote();
        }
      },
      error: (error) => {
        console.error('Error checking user vote:', error);
      }
    });
  }
  
  private getAndDisplayUserVote(): void {
    if (!this.pollId || !this.currentUser || !this.poll) return;
    
    this.voteService.getUserVote(this.pollId, this.currentUser.uid).subscribe({
      next: (vote) => {
        if (vote && this.poll) {
          this.userVoteOption = this.poll.options.find(option => option.id === vote.optionId) || null;
        }
      },
      error: (error) => {
        console.error('Error fetching user vote details:', error);
      }
    });
  }
  
  private fetchVotes(): void {
    if (!this.pollId) return;

    this.voteService.getPollVotes(this.pollId).subscribe({
      next: (votes) => {
        this.poll?.options.forEach(option => {
          option.voters = votes
            .filter(vote => vote.optionId === option.id)
            .map(vote => vote.userDisplayName || 'Anonymous');
        });
      },
      error: (error) => {
        console.error('Error fetching votes:', error);
      }
    });
  }
  
  selectOption(optionId: string): void {
    this.selectedOptionId = optionId;
  }
  
  async submitVote(): Promise<void> {
    if (!this.pollId || !this.selectedOptionId || !this.currentUser) return;
    
    this.isVoting = true;
    this.errorMessage = '';
    
    try {      
      await this.pollService.vote(this.pollId, this.selectedOptionId);      
      this.successMessage = 'Your vote has been recorded!';
      this.hasVoted = true;
      await this.pollService.getPoll(this.pollId).subscribe((poll)=>{
        this.poll = poll;
        if(this.poll){
          this.userVoteOption = this.poll.options.find(option => option.id === this.selectedOptionId) || null;
        }



        this.renderChart();
      })
    } catch (error) {
      console.error('Error submitting vote:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to submit vote. Please try again.';
    } finally {
      this.isVoting = false;
    }
  }
  
  async togglePollStatus(): Promise<void> {
    if (this.pollId && this.isCreator && this.poll) {
      const action = this.poll.isActive ? 'close' : 'reopen';
      const confirmation = confirm(`Are you sure you want to ${action} this poll?`);
      
      if (confirmation) {
        this.isToggling = true;
        this.errorMessage = '';
        try {
          await this.pollService.togglePollStatus(this.pollId);
          this.successMessage = `Poll ${action}d successfully!`;
          this.loadPoll();
        } catch (error) {
          console.error('Error toggling poll status:', error);
          this.errorMessage = 'Failed to update poll status.';
        } finally {
          this.isToggling = false;
        }
      }
    }
  }
  
  confirmDeletePoll(): void {
    if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      this.deletePoll();
    }
  }
  
  async deletePoll(): Promise<void> {
    if (!this.pollId || !this.isCreator) return;
    
    this.isDeleting = true;
    
    try {
      await this.pollService.deletePoll(this.pollId);
      this.router.navigate(['/polls']);
    } catch (error) {
      console.error('Error deleting poll:', error);
      this.errorMessage = 'Failed to delete poll.';
      this.isDeleting = false;
    }
  }
  
  getPercentage(option: PollOption): number {
    if (!this.poll || !this.poll.totalVotes || this.poll.totalVotes === 0) {
      return 0;
    }
    
    return Math.round((option.votes / this.poll.totalVotes) * 100);
  }
  
  getBarColor(index: number): string {
    const colors = [
      '#423435', // Primary
      '#2563EB',
      '#4F86F7',
      '#7E9CE0',
      '#A3B9EB',
      '#EC6408', // Accent
      '#FF8533',
      '#FFA366'
    ];
    
    return colors[index % colors.length];
  }
  
  private renderChart(): void {
    if (!this.poll) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    const chartElement = document.getElementById('resultsChart') as HTMLCanvasElement;
    if (!chartElement) return;
    
    const ctx = chartElement.getContext('2d');
    if (!ctx) return;
    
    let labels: string[];
    let data: number[];
    let backgroundColors: string[];

    if(this.poll.options.length > 0) {
       labels = this.poll.options.map(option => option.text);
       data = this.poll.options.map(option => option.votes);
       backgroundColors = this.poll.options.map((_, index) => this.getBarColor(index));
    } else {
        labels = ["Option 1", "Option 2", "Option 3"];
        data = [1, 2, 3];
        backgroundColors = this.poll.options.map((_, index) => this.getBarColor(index));

        if (backgroundColors.length < 3){
            backgroundColors = ["#003366", "#2563EB", "#4F86F7"]
        }
    }



    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: { 
        labels: labels,
        datasets: [{
          label: 'Votes',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: 'transparent',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percent = this.poll?.totalVotes 
                  ? Math.round((value / this.poll.totalVotes) * 100) 
                  : 0;
                return `${value} vote${value !== 1 ? 's' : ''} (${percent}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
}