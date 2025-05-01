import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2 class="auth-title">Create an Account</h2>
        
        @if (errorMessage) {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        }
        
        <form (ngSubmit)="register()" #registerForm="ngForm">
          <div class="form-group">
            <label for="displayName">Display Name</label>
            <input 
              type="text" 
              id="displayName" 
              name="displayName"
              class="form-control" 
              [(ngModel)]="displayName" 
              required
              minlength="3"
              #displayNameInput="ngModel"
              [class.is-invalid]="displayNameInput.invalid && displayNameInput.touched"
            >
            @if (displayNameInput.invalid && displayNameInput.touched) {
              <div class="error-message">
                Display name must be at least 3 characters.
              </div>
            }
          </div>
          
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
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword"
              class="form-control" 
              [(ngModel)]="confirmPassword" 
              required
              #confirmPasswordInput="ngModel"
              [class.is-invalid]="(confirmPasswordInput.dirty && password !== confirmPassword)"
            >
            @if (confirmPasswordInput.dirty && password !== confirmPassword) {
              <div class="error-message">
                Passwords do not match.
              </div>
            }
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="registerForm.invalid || password !== confirmPassword || isLoading"
          >
            @if (isLoading) {
              <span>Creating Account...</span>
            } @else {
              <span>Register</span>
            }
          </button>
        </form>
        
        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/login">Log In</a></p>
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
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;
  
  private authService = inject(AuthService);
  
  async register(): Promise<void> {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.registerUser(this.email, this.password, this.displayName);
    } catch (error) {
      console.error('Registration error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private getErrorMessage(error: any): string {
    const errorCode = error.code;
    
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'This email address is already in use.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      default:
        return 'An error occurred during registration. Please try again.';
    }
  }
}