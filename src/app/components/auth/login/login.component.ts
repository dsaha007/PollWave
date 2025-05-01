import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">Log In to PollWave</h2>
        
        @if (errorMessage) {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        }
        
        <form (ngSubmit)="login()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              class="form-control" 
              [(ngModel)]="email" 
              required
              email
              #emailInput="ngModel"
              [class.is-invalid]="emailInput.invalid && emailInput.touched"
            >
            @if (emailInput.invalid && emailInput.touched) {
              <div class="error-message">
                Please enter a valid email address.
              </div>
            }
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              class="form-control" 
              [(ngModel)]="password" 
              required
              minlength="6"
              #passwordInput="ngModel"
              [class.is-invalid]="passwordInput.invalid && passwordInput.touched"
            >
            @if (passwordInput.invalid && passwordInput.touched) {
              <div class="error-message">
                Password must be at least 6 characters.
              </div>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="loginForm.invalid || isLoading"
          >
            @if (isLoading) {
              <span>Logging in...</span>
            } @else {
              <span>Log In</span>
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 20px;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
    }
    
    .auth-title {
      color: var(--primary-color);
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--text-color);
    }
    
    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 16px;
      transition: var(--transition);
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(0, 51, 102, 0.2);
    }
    
    .is-invalid {
      border-color: var(--danger-color);
    }
    
    .error-message {
      color: var(--danger-color);
      font-size: 14px;
      margin-top: 5px;
    }
    
    .btn-block {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      margin-top: 10px;
    }
    
    .auth-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 14px;
    }
    
    .auth-footer a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 500;
    }
    
    .auth-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  
  private authService = inject(AuthService);
  
  async login(): Promise<void> {
    if (!this.email || !this.password) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.login(this.email, this.password);
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private getErrorMessage(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return errorCode === 'auth/user-not-found'
        ? 'User does not exist.'
        : 'Invalid email or password.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      default:
        return 'Invalid email or password.';
    }
  }
}