import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PollService } from '../../../services/poll.service';
import { AuthService } from '../../../services/auth.service';
import { Poll } from '../../../models/poll.model';
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
            <option value="custom">Custom Categories</option> 
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
            </div>
          </div>
  }
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

    
    .poll-actions {
      display: flex;
      justify-content: center;
    }
    
    .no-polls {
      text-align: center;
      padding: 40px 0;
    }
    
    .no-polls p {
      margin-bottom: 20px;
      font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
      .poll-list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
      
      .filter-controls {
        flex-direction: column;
        gap: 12px;
      }
      
      .filter-status, .filter-category, .filter-type {
        width: 100%;
      }
    }
  `]
})
export class ListPollsComponent implements OnInit, OnDestroy {
  private pollsSubscription: Subscription | undefined;
  isLoading = true;
  allPolls: Poll[] = [];
  filteredPolls: Poll[] = [];
  searchQuery = '';
  statusFilter = 'all';
  categoryFilter = ''; // Category filter
  typeFilter = 'all'; // New field for anonymous/non-anonymous filter
  categories = ['Technology', 'Health', 'Education', 'Sports', 'Entertainment']; // Example categories

  private pollService = inject(PollService);
  private authService = inject(AuthService);

  user$ = this.authService.user$;

  ngOnInit(): void {
    this.loadAndSubscribePolls();
  }

  ngOnDestroy(): void {
    if (this.pollsSubscription) {
      this.pollsSubscription.unsubscribe();
    }
  }

  private loadAndSubscribePolls(): void {
    this.isLoading = true;
    this.pollsSubscription = this.pollService.latestPolls$.subscribe({
      next: (updatedPolls: Poll[]) => {
        this.allPolls = updatedPolls;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error listening to poll updates:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allPolls];
  
    if (this.searchQuery?.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(poll =>
        poll.question.toLowerCase().includes(query)
      );
    }
  
    if (this.statusFilter !== 'all') {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter(poll => poll.isActive === isActive);
    }
  
    if (this.categoryFilter) {
      if (this.categoryFilter === 'custom') {
        // Show all polls with isCustomCategory set to true
        filtered = filtered.filter(poll => poll.isCustomCategory);
      } else {
        // Filter polls by the selected category
        filtered = filtered.filter(poll => poll.category === this.categoryFilter);
      }
    }
  
    if (this.typeFilter !== 'all') {
      const isAnonymous = this.typeFilter === 'anonymous';
      filtered = filtered.filter(poll => poll.isAnonymous === isAnonymous);
    }
  
    this.filteredPolls = filtered;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
    this.categoryFilter = '';
    this.typeFilter = 'all'; // Reset type filter
    this.applyFilters();
  }
}
