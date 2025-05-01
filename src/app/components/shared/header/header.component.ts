import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a routerLink="/">
              <h1>PollWave</h1>
            </a>
          </div>
          
          <nav class="nav">
            <ul class="nav-list">
              <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
              <li><a routerLink="/polls" routerLinkActive="active">Polls</a></li>
              @if (user$ | async) {
                <li><a routerLink="/polls/create" routerLinkActive="active">Create Poll</a></li>
                <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
                <li><a href="#" (click)="logout($event)">Logout</a></li>
              } @else {
                <li><a routerLink="/login" routerLinkActive="active">Login</a></li>
                <li><a routerLink="/register" routerLinkActive="active">Register</a></li>
              }
            </ul>
          </nav>
          
          <div class="mobile-menu-toggle" (click)="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        @if (mobileMenuOpen) {
          <div class="mobile-menu">
            <ul class="mobile-nav-list">
              <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">Home</a></li>
              <li><a routerLink="/polls" routerLinkActive="active" (click)="closeMobileMenu()">Polls</a></li>
              @if (user$ | async) {
                <li><a routerLink="/polls/create" routerLinkActive="active" (click)="closeMobileMenu()">Create Poll</a></li>
                <li><a routerLink="/profile" routerLinkActive="active" (click)="closeMobileMenu()">Profile</a></li>
                <li><a href="#" (click)="logout($event); closeMobileMenu()">Logout</a></li>
              } @else {
                <li><a routerLink="/login" routerLinkActive="active" (click)="closeMobileMenu()">Login</a></li>
                <li><a routerLink="/register" routerLinkActive="active" (click)="closeMobileMenu()">Register</a></li>
              }
            </ul>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: var(--primary-color);
      color: var(--light-text);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: var(--light-text);
    }
    
    .logo a {
      text-decoration: none;
      color: var(--light-text);
    }
    
    .nav-list {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .nav-list li {
      margin-left: 24px;
    }
    
    .nav-list a {
      color: var(--light-text);
      text-decoration: none;
      font-weight: 500;
      padding: 5px 0;
      transition: color 0.3s ease;
      position: relative;
    }
    
    .nav-list a:hover,
    .nav-list a.active {
      color: var(--accent-color);
    }
    
    .nav-list a::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
    }
    
    .nav-list a:hover::after,
    .nav-list a.active::after {
      width: 100%;
    }
    
    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      width: 30px;
      height: 21px;
      cursor: pointer;
    }
    
    .mobile-menu-toggle span {
      display: block;
      height: 3px;
      width: 100%;
      background-color: var(--light-text);
      border-radius: 3px;
      transition: all 0.3s ease;
    }
    
    .mobile-menu {
      padding: 16px 0;
      background-color: var(--primary-color);
    }
    
    .mobile-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .mobile-nav-list li {
      margin-bottom: 12px;
    }
    
    .mobile-nav-list a {
      color: var(--light-text);
      text-decoration: none;
      font-size: 18px;
      display: block;
      padding: 8px 0;
    }
    
    .mobile-nav-list a:hover,
    .mobile-nav-list a.active {
      color: var(--accent-color);
    }
    
    @media (max-width: 768px) {
      .nav {
        display: none;
      }
      
      .mobile-menu-toggle {
        display: flex;
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  user$ = this.authService.user$;
  mobileMenuOpen = false;

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}