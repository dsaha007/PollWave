import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../models/poll.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <section class="hero">
        <div class="container">
          <div class="hero-content">
            <h1>Create and Share Interactive Polls</h1>
            <p>
              Instantly gather feedback, make decisions, and see real-time results 
              with our user-friendly polling platform.
            </p>
            <div class="hero-cta">
              @if (user$ | async) {
                <a routerLink="/polls/create" class="btn btn-accent">Create New Poll</a>
                <a routerLink="/polls" class="btn btn-accent">Browse Polls</a>
              } @else {
                <a routerLink="/register" class="btn btn-accent">Sign Up Free</a>
                <a routerLink="/login" class="btn btn-accent">Log In</a>
              }
            </div>
          </div>
        </div>
      </section>
      
      <section class="featured-polls">
        <div class="container">
          <h2>Latest Polls</h2>
          
          @if (isLoading) {
            <div class="spinner"></div>
          } @else if (latestPolls.length === 0) {
            <div class="no-polls">
              <p>No polls available yet.</p>
              @if (user$ | async) {
                <a routerLink="/polls/create" class="btn btn-accent">Create the First Poll</a>
              } @else {
                <p>Sign up to create the first poll!</p>
                <a routerLink="/register" class="btn btn-accent">Sign Up Now</a>
              }
            </div>
          } @else {
            <div class="polls-grid">
              @for (poll of latestPolls; track poll.id) {
                <div class="poll-card" [class.closed-poll]="!poll.isActive" [class.active-poll]="poll.isActive">
                  <h3>{{ poll.question }}</h3>
                  <div class="poll-meta">
                    <span class="poll-status" [class.active]="poll.isActive">
                      {{ poll.isActive ? 'Active' : 'Closed' }}
                    </span>
                    <span class="poll-votes">{{ poll.totalVotes || 0 }} votes</span>
                    <span class="poll-created">
                      Created: {{ poll.createdAt | date:'mediumDate' }}
                    </span>
                  </div>
                  <a [routerLink]="['/polls', poll.id]" class="btn btn-outline">View Poll</a>
                </div>
              }
            </div>
            
            <div class="text-center">
              <a routerLink="/polls" class="btn btn-primary">View All Polls</a>
            </div>
          }
        </div>
      </section>
      
      <section class="features">
        <div class="container">
          <h2>Why Choose PollWave?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">📊</div>
              <h3>Real-time Results</h3>
              <p>See votes as they happen with live updates and beautiful visualizations.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔒</div>
              <h3>Secure Voting</h3>
              <p>Each user votes only once, ensuring accurate and fair results.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Create and vote on polls from any device with our responsive design.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🔗</div>
              <h3>Easy Sharing</h3>
              <p>Share your polls anywhere with simple links or embed them on websites.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section class="cta-section">
        <div class="container">
          <div class="cta-content">
            <h2>Ready to create your first poll?</h2>
            <p>Join thousands of users already making better decisions with PollWave.</p>
            @if (user$ | async) {
              <a routerLink="/polls/create" class="btn btn-accent">Create a Poll Now</a>
            } @else {
              <a routerLink="/register" class="btn btn-accent">Get Started Free</a>
            }
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      padding-bottom: 40px;
    }
    
    .hero {
      background-color: var(--primary-color);
      color: var(--light-text);
      padding: 80px 0;
      text-align: center;
    }
    
    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    
    .hero p {
      font-size: 1.25rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    
    .hero-cta {
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    
    .hero-cta .btn {
      padding: 12px 24px;
      font-size: 1.1rem;
    }
    
    .featured-polls {
      padding: 60px 0;
    }
    
    .featured-polls h2,
    .features h2 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 40px;
      text-align: center;
      color: var(--primary-color);
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
      background-color: #e6ffe6; /* Light green */
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
      margin-bottom: 20px;
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
    
    .no-polls {
      text-align: center;
      padding: 40px 0;
    }
    
    .no-polls p {
      margin-bottom: 20px;
      font-size: 1.1rem;
    }
    
    .features {
      padding: 60px 0;
      background-color: #f9f9f9;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
      text-align: center;
      transition: var(--transition);
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
    }
    
    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    
    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 15px;
      color: var(--primary-color);
    }
    
    .feature-card p {
      font-size: 1rem;
      color: #666;
    }
    
    .cta-section {
      padding: 80px 0;
      background-color: var(--primary-color);
      color: var(--light-text);
      text-align: center;
    }
    
    .cta-content {
      max-width: 700px;
      margin: 0 auto;
    }
    
    .cta-section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    
    .cta-section p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }
    
    .cta-section .btn {
      padding: 12px 30px;
      font-size: 1.1rem;
    }
    
    @media (max-width: 768px) {
      .hero {
        padding: 60px 0;
      }
      
      .hero h1 {
        font-size: 2.2rem;
      }
      
      .hero p {
        font-size: 1.1rem;
      }
      
      .hero-cta {
        flex-direction: column;
        align-items: center;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .cta-section h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  isLoading = true;
  latestPolls: Poll[] = [];
  
  private authService = inject(AuthService);
  private pollService = inject(PollService);
  
  user$ = this.authService.user$;
  
  ngOnInit(): void {
    this.loadLatestPolls();
  }
  
  private loadLatestPolls(): void {
    this.pollService.latestPolls$.subscribe({
      next: (polls) => {
        this.latestPolls = polls;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading latest polls:', error);
        this.isLoading = false;
      }
    });
  }
}