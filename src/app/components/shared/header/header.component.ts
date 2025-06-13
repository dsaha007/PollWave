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
            <div class="logo-container">
              <a routerLink="/">
                  <img src="assets/logo.png" alt="PollWave logo" />
                  <h1><span>PollWave</span></h1>
              </a>
            </div>
          </div>
          
          <nav class="nav">
            <ul class="nav-list">
              <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
              <li><a routerLink="/polls" routerLinkActive="active">Polls</a></li>
              <ng-container *ngIf="user$ | async as user; else guestLinks">
                <ng-container *ngIf="user.isAdmin">
                  <li class="admin-dropdown" [class.open]="adminDropdownOpen" (mouseenter)="openAdminDropdown()" (mouseleave)="closeAdminDropdown()">
                    <button type="button" class="admin-dropbtn" (click)="toggleAdminDropdown($event)">
                      Admin
                      <span class="arrow">&#9662;</span>
                    </button>
                    <ul class="admin-dropdown-content">
                      <li><a routerLink="/admin/categories" routerLinkActive="active" (click)="closeAdminDropdown()">Manage Categories</a></li>
                      <li><a routerLink="/admin/users" routerLinkActive="active" (click)="closeAdminDropdown()">Manage Users</a></li>
                      <li><a routerLink="/admin/polls" routerLinkActive="active" (click)="closeAdminDropdown()">Manage Polls</a></li>
                      <li><a routerLink="/admin/analytics" routerLinkActive="active" (click)="closeAdminDropdown()">Analytics</a></li>
                    </ul>
                  </li>
                </ng-container>
                <li><a routerLink="/polls/create" routerLinkActive="active">Create Poll</a></li>
                <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
                <li><a href="#" (click)="logout($event)">Logout</a></li>
              </ng-container>
              <ng-template #guestLinks>
                <li><a routerLink="/login" routerLinkActive="active">Login</a></li>
                <li><a routerLink="/register" routerLinkActive="active">Register</a></li>
              </ng-template>
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
              <ng-container *ngIf="user$ | async as user; else guestMobileLinks">
                <ng-container *ngIf="user.isAdmin">
                  <li>
                    <button class="mobile-admin-label" (click)="toggleAdminMobileMenu()" [attr.aria-expanded]="showAdminMobileMenu">
                      Admin
                      <span class="arrow" [class.open]="showAdminMobileMenu">&#9662;</span>
                    </button>
                    <ul class="mobile-admin-list" *ngIf="showAdminMobileMenu">
                      <li><a routerLink="/admin/categories" (click)="closeMobileMenu()">Manage Categories</a></li>
                      <li><a routerLink="/admin/users" (click)="closeMobileMenu()">Manage Users</a></li>
                      <li><a routerLink="/admin/polls" (click)="closeMobileMenu()">Manage Polls</a></li>
                      <li><a routerLink="/admin/analytics" (click)="closeMobileMenu()">Analytics</a></li>
                    </ul>
                  </li>
                </ng-container>
                <li><a routerLink="/polls/create" routerLinkActive="active" (click)="closeMobileMenu()">Create Poll</a></li>
                <li><a routerLink="/profile" routerLinkActive="active" (click)="closeMobileMenu()">Profile</a></li>
                <li><a href="#" (click)="logout($event); closeMobileMenu()">Logout</a></li>
              </ng-container>
              <ng-template #guestMobileLinks>
                <li><a routerLink="/login" routerLinkActive="active" (click)="closeMobileMenu()">Login</a></li>
                <li><a routerLink="/register" routerLinkActive="active" (click)="closeMobileMenu()">Register</a></li>
              </ng-template>
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
    .logo-container {
      display: flex;
      align-items: center;
    }
    .logo-container a {
      display: flex;
      align-items: center;
      text-decoration: none;
      color: var(--light-text);
    }
    .logo h1 {
      font-size: 24px;
      font-weight: 700;
      margin: 0;
      color: var(--light-text);
    }
    .logo h1 span {
      font-size: inherit;
      display: flex;
      align-items: center;
    }
    .logo img {
      width: 40px;
      margin-right: 10px;
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
    .admin-dropdown {
      position: relative;
    }
    .admin-dropbtn {
      background: none;
      border: none;
      color: inherit;
      font: inherit;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0;
    }
    .admin-dropdown .arrow {
      font-size: 0.8em;
    }
    .admin-dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      min-width: 180px;
      background: #fff;
      color: var(--primary-color);
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      border-radius: 8px;
      z-index: 100;
      padding: 8px 0;
    }
    .admin-dropdown.open .admin-dropdown-content,
    .admin-dropdown:focus-within .admin-dropdown-content {
      display: block;
    }
    .admin-dropdown-content li {
      padding: 0;
    }
    .admin-dropdown-content a {
      display: block;
      padding: 10px 18px;
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
      border-radius: 4px;
      transition: background 0.2s, color 0.2s;
    }
    .admin-dropdown-content a:hover,
    .admin-dropdown-content a.active {
      background: var(--accent-color);
      color: #fff;
    }
    .mobile-admin-label {
      font-weight: bold;
      color: var(--accent-color);
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      background: none;
      border: none;
      font-size: 18px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      padding: 8px 0;
    }
    .mobile-admin-label .arrow {
      margin-left: 8px;
      transition: transform 0.2s;
    }
    .mobile-admin-label .arrow.open {
      transform: rotate(180deg);
    }
    .mobile-admin-list {
      list-style: none;
      padding-left: 16px;
      margin: 0 0 8px 0;
      animation: fadeIn 0.2s;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-8px);}
      to { opacity: 1; transform: translateY(0);}
    }
    @media (max-width: 768px) {
      .nav { display: none; }
      .mobile-menu-toggle { display: flex; }
      .admin-dropdown { display: none !important; }
    }
    @media (min-width: 769px) {
      .admin-dropdown { display: block !important; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  user$ = this.authService.user$;
  mobileMenuOpen = false;
  showAdminMenu = false;
  showAdminMobileMenu = false;
  adminDropdownOpen = false;

  logout(event: Event): void {
    event.preventDefault();
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.showAdminMobileMenu = false;
  }

  toggleAdminMobileMenu(): void {
    this.showAdminMobileMenu = !this.showAdminMobileMenu;
  }

  toggleAdminDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.adminDropdownOpen = !this.adminDropdownOpen;
  }

  openAdminDropdown(): void {
    this.adminDropdownOpen = true;
  }

  closeAdminDropdown(): void {
    this.adminDropdownOpen = false;
  }
  
}