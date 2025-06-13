import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PollService } from '../../../services/poll.service';
import { AuthService } from '../../../services/auth.service';
import { CategoryService } from '../../../services/category.service';
import { ReportService } from '../../../services/report.service';
import { Poll } from '../../../models/poll.model';
import { Category } from '../../../models/category.model';
import { Subscription } from 'rxjs';

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
        <div class="spinner"></div>
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
              <button 
                class="btn btn-outline danger" 
                (click)="openReportDialog(poll)"
                *ngIf="user$ | async"
              >Report</button>
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
  `,
  styles: [`
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
    
    .search-box {
      flex: 1;
    }
    
    .filter-status, .filter-category, .filter-type {
      width: 200px;
    }
    
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .poll-card {
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 24px;
      transition: var(--transition);
    }
    
    .poll-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }
    
    .poll-card.closed-poll {
      background-color: #ffe6e6; /* Light red */
    }

    .poll-card.active-poll {
        background-color: #e0ffe0;
      }
    
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
      background-color: #ccc;
      color: #333;
    }
    
    .poll-status.active {
      background-color: var(--success-color);
      color: white;
    }
    
    .poll-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 0.9rem;
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
      background-color: var(--primary-color);
      color: white;
      font-weight: bold;
    }
  `]
})
export class ListPollsComponent implements OnInit, OnDestroy {
  lastVisible: any; 
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
    this.fetchTotalPollCount();
    this.loadPolls();
  }

  ngOnDestroy(): void {
    if (this.pollsSubscription) {
      this.pollsSubscription.unsubscribe();
    }
  }

  fetchTotalPollCount(): void {
    this.pollService.getTotalPollCount().subscribe({
      next: (count) => {
        this.totalPolls = count;
        this.totalPages = Math.ceil(this.totalPolls / this.pageSize);
      },
      error: (error) => {
        console.error('Error fetching total poll count:', error);
      },
    });
  }

  loadPolls(): void {
    this.isLoading = true;
  
    this.pollService
      .getPaginatedPolls(this.pageSize, this.lastVisible)
      .subscribe({
        next: ({ polls, lastVisible }) => {
          this.allPolls = polls;
          this.lastVisible = lastVisible; 
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching paginated polls:', error);
          this.isLoading = false;
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
  
    if (page === 1) {
      this.lastVisible = null;
    }
  
    this.loadPolls();
  }

  applyFilters(): void {
    let filtered = [...this.allPolls];

    if (this.searchQuery?.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter((poll) =>
        poll.question.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter((poll) => poll.isActive === isActive);
    }

    if (this.categoryFilter) {
      if (this.categoryFilter === 'custom') {
        filtered = filtered.filter((poll) => poll.isCustomCategory);
      } else {
        filtered = filtered.filter((poll) => poll.category === this.categoryFilter);
      }
    }

    if (this.typeFilter !== 'all') {
      const isAnonymous = this.typeFilter === 'anonymous';
      filtered = filtered.filter((poll) => poll.isAnonymous === isAnonymous);
    }

    this.filteredPolls = filtered;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.categoryFilter = '';
    this.typeFilter = 'all';
    this.applyFilters();
  }

  openReportDialog(poll: Poll) {
    const reason = prompt('Why are you reporting this poll? (optional)');
    if (reason !== null) {
      this.reportService.reportPoll(poll.id!, reason || 'No reason provided')
        .then(() => alert('Thank you for reporting.'))
        .catch(err => alert(err.message));
    }
  }
}
