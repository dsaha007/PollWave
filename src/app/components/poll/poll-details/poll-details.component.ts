import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../services/auth.service';
import { PollService } from '../../../services/poll.service';
import { VoteService } from '../../../services/vote.service';
import { ReportService } from '../../../services/report.service';
import { Poll, PollOption } from '../../../models/poll.model';
import { Subscription } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      @if (isLoading) {
        <div class="global-spinner"></div>
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
            <span 
              class="poll-type-badge" 
              [ngClass]="poll.isAnonymous ? 'anonymous' : 'non-anonymous'"
              [title]="poll.isAnonymous ? 'Your vote is private' : 'Your name will be visible in results'"
            >
              <ng-container *ngIf="poll.isAnonymous">🕵️‍♂️ Anonymous Poll</ng-container>
              <ng-container *ngIf="!poll.isAnonymous">👤 Non-Anonymous Poll</ng-container>
            </span>
            <div class="poll-meta">
              <span class="poll-votes">{{ poll.totalVotes || 0 }} votes</span>
              <span class="poll-status" [class.active]="poll.isActive">
                {{ poll.isActive ? 'Active' : 'Closed' }}
              </span>
            </div>
            <div class="poll-category">
              <strong>Category:</strong> 
              {{ poll.category === 'None' ? 'No Category' : poll.category }}
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
            <div class="options-list" [ngClass]="{'grid-options': poll.options.length > 4}">
              @for (option of poll.options; track option.id) {
                <div 
                  class="option-item" 
                  [class.selected]="selectedOptionId === option.id"
                  (click)="submitVote(option.id)" 
                >
                  <span class="option-text">{{ option.text }}</span>
                  <span class="option-check" *ngIf="selectedOptionId === option.id">✓</span>
                </div>
              }
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
              
              <div class="results-table" [ngClass]="{'grid-options': poll.options.length > 4}">
                <div *ngFor="let option of poll?.options; let optionIdx = index"
                     class="result-row"
                     (mouseenter)="showVoterList(optionIdx)"
                     (mouseleave)="hideVoterList()"
                     (touchstart)="showVoterList(optionIdx)"
                     (touchend)="hideVoterList()"
                     style="position:relative;">
                  <div class="result-text">{{ option.text }}</div>
                  <div class="result-bar-container">
                    <div 
                      class="result-bar" 
                      [style.width.%]="getPercentage(option)"
                      [style.background-color]="getBarColor(optionIdx)"
                    ></div>
                    <div class="result-percentage">{{ getPercentage(option) }}%</div>
                  </div>
                  <div class="result-votes">{{ option.votes }} vote{{ option.votes !== 1 ? 's' : '' }}</div>
                  <!-- Voter overlay on hover/tap -->
                  <div 
                    *ngIf="!poll.isAnonymous && option.voters?.length && activeVoterListIndex === optionIdx"
                    class="voter-list-overlay"
                  >
                    <strong>Voters for {{ option.text }}:</strong>
                    <ul>  
                      <li *ngFor="let voter of option.voters">{{ voter }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div *ngIf="showVoterModal" class="modal-overlay">
          <div class="modal-content voter-modal">
            <button class="modal-close" (click)="closeVoterModal()">&times;</button>
            <h2 class="modal-title">Voter Name</h2>
            <div class="voter-full-name">{{ selectedVoterName }}</div>
            <div class="modal-actions">
              <button class="btn btn-outline" (click)="closeVoterModal()">Close</button>
            </div>
          </div>
          </div>

          <div class="poll-actions">
            <a routerLink="/polls" class="btn btn-outline">Back to Polls</a>
            <button class="btn btn-outline" (click)="sharePoll()">Share Poll</button>
            @if (isCreator && poll) {
              <button 
                class="btn" 
                [class]="poll.isActive ? 'btn-outline' : 'btn-accent'"
                (click)="togglePollStatus()"
                [disabled]="isToggling"
              >
                {{ poll.isActive ? 'Close Poll' : 'Reopen Poll' }}
              </button>
              
              <button 
                class="btn btn-outline danger"
                (click)="confirmDeletePoll()"
                [disabled]="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Poll' }}
              </button>
            } @else {
              <button 
                class="btn btn-outline danger" 
                (click)="openReportDialog()" 
                *ngIf="currentUser && !isCreator"
              >Report</button>
            }
          </div>

          <!-- Report Modal -->
          <div *ngIf="reportModalOpen" class="modal-overlay">
            <div class="modal-content">
              <button (click)="closeReportModal()" class="modal-close">&times;</button>
              <h2 class="modal-title">Report Poll</h2>
              <p class="modal-desc">Why are you reporting this poll? <span class="optional">(optional)</span></p>
              <textarea [(ngModel)]="reportReason" rows="3" class="form-control modal-textarea" placeholder="Enter reason (optional)"></textarea>
              <div *ngIf="reportError" class="alert alert-danger mb-2">{{ reportError }}</div>
              <div *ngIf="reportSuccess" class="alert alert-success mb-2">Thank you for reporting. Our team will review this poll.</div>
              <div class="modal-actions" *ngIf="!reportSuccess">
                <button class="btn btn-outline" (click)="closeReportModal()" [disabled]="reportSubmitting">Cancel</button>
                <button class="btn btn-outline danger" (click)="submitReport()" [disabled]="reportSubmitting">
                  <span *ngIf="reportSubmitting">Reporting...</span>
                  <span *ngIf="!reportSubmitting">Submit Report</span>
                </button>
              </div>
              <div class="modal-actions" *ngIf="reportSuccess">
                <button class="btn btn-outline" (click)="closeReportModal()">Close</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles : [`
    .poll-details-container {
      max-width: 800px;
      margin: 40px auto;
      background: #fff;
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
    .poll-meta { display: flex; gap: 16px; }
    .poll-status {
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 500;
      background: #ccc;
      color: #333;
    }
    .poll-status.active {
      background: var(--success-color);
      color: #fff;
    }
    .poll-content { margin-bottom: 30px; }
    .poll-category { margin-top: 10px; font-size: 1rem; color: #555; }
    .voting-section { margin-bottom: 30px; }
    .voting-section h2, .results-section h2 {
      font-size: 1.4rem;
      color: var(--primary-color);
      margin-bottom: 16px;
    }
    .options-list { margin-bottom: 20px; }
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
    .option-item:hover, .option-item.selected {
      border-color: var(--primary-color);
      background: rgba(0, 51, 102, 0.1);
    }
    .option-check { color: var(--primary-color); font-weight: bold; }
    .chart-container { height: 300px; margin-bottom: 30px; }
    .results-table { margin-bottom: 20px; }
    .result-row { margin-bottom: 12px; cursor: pointer;}
    .result-text { margin-bottom: 5px; font-weight: 500; }
    .result-bar-container {
      display: flex;
      align-items: center;
      background: #f0f0f0;
      border-radius: 4px;
      height: 24px;
      position: relative;
      overflow: hidden;
      margin-bottom: 5px;
    }
    .result-bar {
      height: 100%;
      min-width: 20px;
      background: var(--primary-color);
      border-radius: 4px;
      transition: width 0.5s;
    }
    .result-percentage {
      position: absolute;
      right: 10px;
      color: #333;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .result-votes { font-size: 0.9rem; color: #666; }
    .poll-closed-banner, .login-to-vote, .already-voted {
      background: #f8f9fa;
      border-radius: var(--border-radius);
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .poll-closed-banner { border-left: 4px solid #dc3545; }
    .login-to-vote { border-left: 4px solid var(--primary-color); }
    .already-voted { border-left: 4px solid var(--accent-color); }
    .poll-actions {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
    .danger { color: var(--danger-color); border-color: var(--danger-color); }
    .danger:hover { background: var(--danger-color); color: #fff; }
    .poll-not-found { text-align: center; padding: 60px 0; }
    .poll-not-found h2 { font-size: 2rem; color: var(--primary-color); margin-bottom: 16px; }
    .poll-not-found p { font-size: 1.1rem; margin-bottom: 24px; color: #666; }
    @media (max-width: 768px) {
      .poll-details-container { padding: 20px; }
      .poll-actions { flex-wrap: wrap; gap: 10px; }
      .poll-actions .btn { flex: 1 0 auto; }
    }
    .result-voters { margin-top: 10px; font-size: 0.9rem; color: #555; }
    .voter-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .voter-avatar {
      width: 32px; height: 32px; background: #FFDEAD; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: bold; color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s;
    }
    .voter-avatar:hover { transform: scale(1.1); }
    .voter-initial { text-transform: uppercase; color: black; }
    .voter-modal {
      max-width: 350px;
      text-align: center;
      padding-top: 36px;
    }
    .voter-full-name {
      font-size: 1.4rem;
      font-weight: bold;
      color: var(--primary-color);
      word-break: break-word;
    }
    .options-list.grid-options,
    .results-table.grid-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (min-width: 600px) {
      .options-list.grid-options,
      .results-table.grid-options {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (min-width: 900px) {
      .options-list.grid-options,
      .results-table.grid-options {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (min-width: 1200px) {
      .options-list.grid-options,
      .results-table.grid-options {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .option-item,
    .result-row {
      width: 100%;
      margin-bottom: 0;
    }
    
    .voter-list-overlay {
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      background: #fff;
      color: var(--primary-color);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.13);
      padding: 12px 20px;
      font-size: 1rem;
      min-width: 180px;
      z-index: 20;
      border: 1px solid #eee;
      margin-top: 8px;
    }
    .voter-list-overlay ul {
      margin: 8px 0 0 0;
      padding: 0;
      list-style: none;
    }
    .voter-list-overlay li {
      padding: 2px 0;
      color: #333;
    }

    .poll-type-badge {
      display: flex;
      justify-content: center;
      padding: 12px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .poll-type-badge.anonymous {
      background: #e0e7ff;
      color: #2d3a6e;
    }
    .poll-type-badge.non-anonymous {
      background: #ffe6e6;
      color: #b71c1c;
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
  activeVoterIndex: number | null = null;
  activeVoterOptionIndex: number | null = null;
  activeVoterListIndex: number | null = null;

  showVoterOverlay(optionIdx: number, voterIdx: number) {
    this.activeVoterOptionIndex = optionIdx;
    this.activeVoterIndex = voterIdx;
  }

  hideVoterOverlay() {
    this.activeVoterOptionIndex = null;
    this.activeVoterIndex = null;
  }

  showVoterList(index: number) {
    this.activeVoterListIndex = index;
  }

  hideVoterList() {
    this.activeVoterListIndex = null;
  }

  private pollSub: Subscription | null = null;
  private userSub: Subscription | null = null;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private pollService = inject(PollService);
  private voteService = inject(VoteService);
  private reportService = inject(ReportService);
  
  get currentUser() {
    return this.authService.getCurrentUser();
  }
  
  ngOnInit(): void {
    this.pollId = this.route.snapshot.paramMap.get('id');
        
    if (this.pollId) {
      this.pollSub = this.pollService.listenToPoll(this.pollId).subscribe({
        next: (poll) => {
          this.poll = poll;
          this.isLoading = false;

          if (poll) {
            this.isCreator = this.currentUser?.uid === poll.createdBy;
            this.checkUserVote();
            this.fetchVotes();

            setTimeout(() => {
              this.renderChart();
            }, 0);
          }
        },
        error: (error) => {
          console.error('Error listening to poll:', error);
          this.isLoading = false;
          this.errorMessage = 'Failed to load poll details.';
        }
      });

      this.userSub = this.authService.user$.subscribe(user => {
        if (user && this.poll) {
          this.isCreator = user.uid === this.poll.createdBy;
          this.checkUserVote();
        }
      });
    } else {
      this.isLoading = false;
      this.errorMessage = "Poll not found";
      this.poll = null;
      
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
    if (!this.pollId || !this.poll) return;

    if (this.poll.isAnonymous) {
      this.poll.options.forEach(option => {
        option.voters = []; 
      });
      this.renderChart();
      return;
    }

    this.voteService.getPollVotes(this.pollId).subscribe({
      next: (votes) => {
        this.poll?.options.forEach(option => {
          option.voters = votes
              .filter(vote => vote.optionId === option.id)
              .map(vote => vote.userDisplayName || 'Anonymous');
        });
        this.renderChart(); 
      },
      error: (error) => {
          if (error.code === 'permission-denied'){
            this.errorMessage = 'You do not have permissions to access this information.';
            return;
          }
        console.error('Error fetching votes:', error);
      }
    });
  }
  
  selectOption(optionId: string): void {
    this.selectedOptionId = optionId;
  }
  
  async submitVote(optionId: string): Promise<void> {
    if (!this.pollId || !optionId || !this.currentUser) return;
  
    this.isVoting = true;
    this.errorMessage = '';
  
    try {
      await this.pollService.vote(this.pollId, optionId); 
      this.successMessage = 'Your vote has been recorded!';
      this.hasVoted = true;
  
      this.selectedOptionId = optionId;
      this.userVoteOption = this.poll?.options.find(option => option.id === optionId) || null;
  
      this.pollService.getPoll(this.pollId).subscribe((poll) => {
        this.poll = poll;
        this.fetchVotes();
        this.renderChart();
      });
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

  sharePoll(): void {
    if (!this.poll) return;
  
    const pollUrl = `${window.location.origin}/polls/${this.pollId}`;
    const shareText = `Check out this poll: "${this.poll.question}"`;
  
    if (navigator.share) {
      navigator.share({
        title: 'PollWave',
        text: shareText,
        url: pollUrl,
      }).catch((error) => console.error('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(pollUrl).then(() => {
        alert('Poll link copied to clipboard!');
      }).catch((error) => console.error('Error copying link:', error));
    }
  }

  openReportDialog() {
  this.openReportModal();
}

showVoterModal = false;
selectedVoterName: string | null = null;

openVoterModal(name: string) {
  this.selectedVoterName = name;
  this.showVoterModal = true;
}

closeVoterModal() {
  this.showVoterModal = false;
  this.selectedVoterName = null;
}

reportModalOpen = false;
reportReason = '';
reportError = '';
reportSubmitting = false;
reportSuccess = false;

openReportModal() {
  this.reportModalOpen = true;
  this.reportReason = '';
  this.reportError = '';
  this.reportSuccess = false;
}

closeReportModal() {
  this.reportModalOpen = false;
  this.reportReason = '';
  this.reportError = '';
  this.reportSuccess = false;
}

async submitReport() {
  this.reportSubmitting = true;
  this.reportError = '';
  try {
    await this.reportService.reportPoll(this.poll!.id!, this.reportReason);
    this.reportSuccess = true;
  } catch (err: any) {
    this.reportError = err.message || 'Failed to report poll.';
  } finally {
    this.reportSubmitting = false;
  }
}
}