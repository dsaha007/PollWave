import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
        
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>
        
        <form (ngSubmit)="login(loginForm)" #loginForm="ngForm">
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
            <div *ngIf="emailInput.invalid && emailInput.touched" class="error-message">
              Email cannot be blank.
            </div>
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
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error-message">
              Password cannot be blank.
            </div>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading">Logging in...</span>
            <span *ngIf="!isLoading">Log In</span>
          </button>
        </form>

        <div class="divider">OR</div>

        <button 
          class="btn btn-google btn-block" 
          (click)="signInWithGoogle()"
          [disabled]="isLoading"
        >
          Sign in with Google
        </button>
        
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
    
    .btn-google {
      background-color: #4285F4;
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-google:hover {
      background-color: #357ae8;
    }
    
    .divider {
      text-align: center;
      margin: 16px 0;
      font-size: 14px;
      color: #666;
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
  
  async login(form: NgForm): Promise<void> {
    if (form.invalid) {
      // Mark all fields as touched to trigger validation messages
      form.controls['email']?.markAsTouched();
      form.controls['password']?.markAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.login(this.email, this.password);
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Invalid email or password.';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Google Sign-In error:', error);
      this.errorMessage = 'Failed to sign in with Google. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}