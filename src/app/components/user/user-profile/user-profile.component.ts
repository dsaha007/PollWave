import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PollService } from '../../../services/poll.service';
import { Poll } from '../../../models/poll.model';
import { Timestamp } from 'firebase/firestore';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="profile-container">
        <div class="profile-header">
          <div class="user-info">
            <div class="user-avatar">
              @if (user?.photoURL) {
                <img [src]="user?.photoURL" alt="Profile picture">
              } @else {
                <div class="avatar-placeholder">
                  {{ getUserInitials() }}
                </div>
              }
            </div>
            <div class="user-details">
              <h1>{{ user?.displayName || 'User' }}</h1>
              <p>{{ user?.email }}</p>
              <p class="user-joined">Member since {{ user?.memberSince | date:'mediumDate' }}</p>
            </div>
          </div>
          
          <div class="profile-actions">
            <a routerLink="/polls/create" class="btn btn-accent">Create New Poll</a>
            <button class="btn btn-outline" (click)="logout()">Sign Out</button>
          </div>
        </div>
        
        <div class="profile-content">
          <h2>Your Polls</h2>
          
          @if (isLoading || !userPolls) {
            <div class="spinner"></div>
          } @else if (userPolls.length === 0) {
            <div class="no-polls">
              <p>You haven't created any polls yet.</p>
              <a routerLink="/polls/create" class="btn btn-accent">Create Your First Poll</a>
            </div>
          } @else {
            <div class="user-polls-grid">
              @for (poll of userPolls; track poll.id) {
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
                    <a [routerLink]="['/polls', poll.id]" class="btn btn-primary">Manage Poll</a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 900px;
      margin: 40px auto;
    }
    
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
      margin-bottom: 30px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    
    .user-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
    }
    
    .user-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background-color: var(--primary-color);
      color: white;
      font-size: 2.5rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-details h1 {
      font-size: 1.8rem;
      color: var(--primary-color);
      margin-bottom: 8px;
    }
    
    .user-joined {
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
    }
    
    .profile-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .profile-content {
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
    }
    
    .profile-content h2 {
      color: var(--primary-color);
      font-size: 1.5rem;
      margin-bottom: 24px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    
    .user-polls-grid {
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
    
    .poll-card.active-poll {
      background-color: #e2fddf;
    }

    .poll-card.closed-poll {
      background-color: #ffe6e6;
    }

    .poll-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    .poll-card h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--primary-color);
    }
    
    .poll-meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
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
      padding: 30px 0;
    }
    
    .no-polls p {
      margin-bottom: 16px;
      font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
      .profile-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 24px;
      }
      
      .profile-actions {
        width: 100%;
      }
      
      .user-info {
        width: 100%;
      }
    }
    
    @media (max-width: 576px) {
      .user-info {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit {
  user: any;
  isLoading = true;
  userPolls: Poll[] | null = null;
  
  private authService = inject(AuthService);
  private pollService = inject(PollService);

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      if (this.user.createdAt instanceof Timestamp) {
        this.user.memberSince = this.user.createdAt.toDate();
      } else if (this.user.createdAt instanceof Date) {
        this.user.memberSince = this.user.createdAt;
      } else {
        this.user.memberSince = new Date(this.user.createdAt);
      }

      this.pollService.listenToUserPolls(this.user.uid);
      this.pollService.userPolls$.subscribe({
        next: (polls) => {
          this.userPolls = polls;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user polls:', error);
          this.isLoading = false;
        },
      });
    }
  }
  
  getUserInitials(): string {
    if (!this.user?.displayName) return '?';
    
    const names = this.user.displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
  
  logout(): void {
    this.authService.logout();
  }
}