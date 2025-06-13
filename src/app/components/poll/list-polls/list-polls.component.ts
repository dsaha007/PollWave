import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Poll } from '../../../models/poll.model';
import { PollService } from '../../../services/poll.service';
import { AuthService } from '../../../services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { ReportService } from '../../../services/report.service';

@Component({
  selector: 'app-list-polls',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="poll-list-header">
        <h1>Browse Polls</h1>
        @if (user$ | async) {
        <a routerLink="/polls/create" class="btn btn-accent">Create New Poll</a>
        }
      </div>
      
      <div class="filter-controls">
        <div class="search-box">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Search polls..." 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()"
          >
        </div>
        <div class="filter-status">
          <select 
            class="form-control" 
            [(ngModel)]="statusFilter" 
            (change)="applyFilters()"
          >
            <option value="all">All Polls</option>
            <option value="active">Active Polls</option>
            <option value="closed">Closed Polls</option>
          </select>
        </div>

        <div class="filter-category">
          <select 
            class="form-control" 
            [(ngModel)]="categoryFilter" 
            (change)="applyFilters()"
          >
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
        </div>

        <div class="filter-type">
          <select 
            class="form-control" 
            [(ngModel)]="typeFilter" 
            (change)="applyFilters()"
          >
            <option value="all">All Types</option>
            <option value="anonymous">Anonymous Polls</option>
            <option value="non-anonymous">Non-Anonymous Polls</option>
          </select>
        </div>
      </div>

      @if (isLoading) {
        <div class="global-spinner"></div>
      } @else if (filteredPolls.length === 0) {
        <div class="no-polls">
          @if (searchQuery || statusFilter !== 'all' || categoryFilter || typeFilter !== 'all') {
            <p>No polls match your filters.</p>
            <button class="btn btn-outline" (click)="resetFilters()">Clear Filters</button>
          } @else {
          <p>No polls available yet.</p>
            @if (user$ | async) {
              <a routerLink="/polls/create" class="btn btn-accent">Create the First Poll</a>
            }
          }
        </div>
      } @else {
        <div class="polls-grid">
        @for (poll of filteredPolls; track poll.id) {
          <div class="poll-card" [class.active-poll]="poll.isActive" [class.closed-poll]="!poll.isActive">
            <h3>{{ poll.question }}</h3>
            <div class="poll-meta">
              <span class="poll-votes">{{ poll.totalVotes || 0 }} votes</span>
              <span class="poll-status" [class.active]="poll.isActive">
                {{ poll.isActive ? 'Active' : 'Closed' }}
              </span>
            </div>
            <p class="poll-options">
              <span>
                <strong>Category:</strong> 
                {{ poll.isCustomCategory ? poll.category : poll.category }}
              </span>
              <span>Created: {{ poll.createdAt | date:'mediumDate' }}</span>
            </p>
            <div class="poll-actions">
              <a [routerLink]="['/polls', poll.id]" class="btn btn-primary">View Results</a>
              <ng-container *ngIf="(user$ | async) as user">
              <button class="btn btn-outline danger" 
                (click)="openReportDialog(poll)"
                *ngIf="user.uid !== poll.createdBy"
              >Report</button>
            </ng-container>
            </div>
          </div>
        }
        </div>

        <div class="pagination-controls">
          <button
            class="btn btn-outline"
            (click)="goToPage(currentPage - 1)"
            [disabled]="currentPage === 1 || isLoading"
          >
            Previous
          </button>

          <button
            *ngFor="let page of [].constructor(totalPages); let i = index"
            class="btn btn-outline"
            [class.active]="currentPage === i + 1"
            (click)="goToPage(i + 1)"
            [disabled]="isLoading"
          >
            {{ i + 1 }}
          </button>

          <button
            class="btn btn-outline"
            (click)="goToPage(currentPage + 1)"
            [disabled]="currentPage === totalPages || isLoading"
          >
            Next
          </button>
        </div>
      }
    </div>
    @if (reportModalOpen) {
  <div class="modal-overlay">
    <div class="modal-content">
      <button (click)="closeReportModal()" class="modal-close">&times;</button>
      <h2 class="modal-title">Report Poll</h2>
      <p class="modal-desc">Why are you reporting this poll? <span class="optional">(optional)</span></p>
      <textarea [(ngModel)]="reportReason" rows="3" class="form-control modal-textarea" placeholder="Enter reason (optional)"></textarea>
      <div *ngIf="reportError" class="alert alert-danger mb-2">{{ reportError }}</div>
      <div class="modal-actions">
        <button class="btn btn-outline" (click)="closeReportModal()" [disabled]="reportSubmitting">Cancel</button>
        <button class="btn btn-outline danger" (click)="submitReport()" [disabled]="reportSubmitting">
          <span *ngIf="reportSubmitting">Reporting...</span>
          <span *ngIf="!reportSubmitting">Submit Report</span>
        </button>
      </div>
    </div>
  </div>
}
    
  `,
  styles : [`
      .poll-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 40px 0 30px;
      }
      .poll-list-header h1 {
        color: var(--primary-color);
        font-size: 2rem;
        margin: 0;
      }
      .filter-controls {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 30px;
      }
      .search-box { flex: 1; }
      .filter-status, .filter-category, .filter-type { width: 200px; }
      .polls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
        margin-bottom: 40px;
      }
      .poll-card {
        background: #fff;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        padding: 24px;
        transition: var(--transition);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .poll-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0,0,0,0.1);
      }
      .poll-card.closed-poll { background: #ffe6e6; }
      .poll-card.active-poll { background: #e0ffe0; }
      .poll-card h3 {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--primary-color);
      }
      .poll-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 0.9rem;
      }
      .poll-status {
        padding: 3px 8px;
        border-radius: 12px;
        font-weight: 500;
        background: #ccc;
        color: #333;
      }
      .poll-status.active { background: var(--success-color); color: #fff; }
      .poll-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-size: 0.9rem;
      }
      .poll-actions{
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        gap: 10px;
        margin-top: 16px;
      }
      .pagination-controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-top: 20px;
      }
      .pagination-controls .btn {
        padding: 8px 16px;
        font-size: 14px;
        cursor: pointer;
      }
      .pagination-controls .btn.active {
        background: var(--primary-color);
        color: #fff;
        font-weight: bold;
      }
      @media (max-width: 900px) {
        .polls-grid { grid-template-columns: 1fr; gap: 16px; }
        .filter-controls { flex-direction: column; gap: 12px; }
      }
      @media (min-width: 600px) {
        .poll-actions { flex-direction: row; gap: 10px; }
      }
      @media (max-width: 600px) {
        .filter-controls { overflow-x: auto; flex-wrap: nowrap; }
      }
      @media (max-width: 500px) {
        .modal-content {
          padding: 18px 6px 12px 6px;
          max-width: 98vw;
        }
      }  
  `]
})
export class ListPollsComponent implements OnInit, OnDestroy {
  private pollsSubscription: Subscription | undefined;
  isLoading = false;
  allPolls: Poll[] = [];
  filteredPolls: Poll[] = [];
  searchQuery = '';
  statusFilter = 'all';
  categoryFilter = '';
  typeFilter = 'all';
  categories: string[] = [];

  pageSize = 10; // Number of polls per page
  currentPage = 1; // Current page number
  totalPolls = 0; // Total number of polls
  totalPages = 0; // Total number of pages

  private pollService = inject(PollService);
  private authService = inject(AuthService);
  private categoryService = inject(CategoryService);
  private reportService = inject(ReportService);

  user$ = this.authService.user$;

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats.map(cat => cat.name);
    });

    this.isLoading = true;
    this.pollsSubscription = this.pollService.getPolls().subscribe({
      next: (polls) => {
        this.allPolls = polls;
        this.totalPolls = polls.length;
        this.totalPages = Math.ceil(this.totalPolls / this.pageSize);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching polls:', error);
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.pollsSubscription) {
      this.pollsSubscription.unsubscribe();
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allPolls];

    if (this.searchQuery?.trim()) {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(poll =>
        poll.question.toLowerCase().includes(query) ||
        (poll.category && poll.category.toLowerCase().includes(query))
      );
    }

    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(poll =>
        this.statusFilter === 'active' ? poll.isActive : !poll.isActive
      );
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(poll => poll.category === this.categoryFilter);
    }

    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(poll =>
        this.typeFilter === 'anonymous' ? poll.isAnonymous : !poll.isAnonymous
      );
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredPolls = filtered.slice(start, end);
    this.totalPolls = filtered.length;
    this.totalPages = Math.ceil(this.totalPolls / this.pageSize);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.categoryFilter = '';
    this.typeFilter = 'all';
    this.currentPage = 1;
    this.applyFilters();
  }

  reportModalOpen = false;
  reportingPoll: Poll | null = null;
  reportReason = '';
  reportError = '';
  reportSubmitting = false;

  openReportDialog(poll: Poll) {
    this.reportingPoll = poll;
    this.reportReason = '';
    this.reportError = '';
    this.reportModalOpen = true;
  }

  closeReportModal() {
    this.reportModalOpen = false;
    this.reportingPoll = null;
    this.reportReason = '';
    this.reportError = '';
  }

  async submitReport() {
    if (!this.reportingPoll) return;
    this.reportSubmitting = true;
    this.reportError = '';
    try {
      await this.reportService.reportPoll(this.reportingPoll.id!, this.reportReason);
      this.closeReportModal();
    } catch (err: any) {
      this.reportError = err.message || 'Failed to report poll.';
    } finally {
      this.reportSubmitting = false;
    }
  }
}