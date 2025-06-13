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
            <label for="email">Email <span class="required">*</span></label>
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
              <p *ngIf="emailInput.errors?.['required']">Email is required.</p>
              <p *ngIf="emailInput.errors?.['email']">Invalid email format.</p>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password<span class="required">*</span></label>
            <input 
              type="password" 
              id="password" 
              name="password"
              class="form-control" 
              [(ngModel)]="password" 
              required
              #passwordInput="ngModel"
              [class.is-invalid]="passwordInput.invalid && passwordInput.touched"
            >
            <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error-message">
              <p *ngIf="passwordInput.errors?.['required']">Password is required.</p>
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
          <p><a (click)="openForgotPasswordModal()" class="forgot-password-link">Forgot Password?</a></p>
        </div>


        <div *ngIf="isForgotPasswordModalOpen" class="modal">
          <div class="modal-content">
            <span class="close" (click)="closeForgotPasswordModal()">&times;</span>
            <h2>Reset Password</h2>
            <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
              <div class="form-group">
                <label for="resetEmail">Email</label>
                <input 
                  type="email" 
                  id="resetEmail" 
                  name="resetEmail"
                  class="form-control" 
                  [(ngModel)]="resetEmail" 
                  required
                  email
                >
              </div>
              <button type="submit" class="btn btn-primary btn-block">Send Reset Link</button>
            </form>
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
    .required {
      color: var(--danger-color);
      font-weight: bold;
    }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-content h2 {
      margin-bottom: 20px;
      font-size: 1.5rem;
      text-align: center;
    }

    .modal-content .form-group {
      margin-bottom: 15px;
    }

    .modal-content .btn {
      width: 100%;
      margin-top: 10px;
    }

    .forgot-password-link {
      cursor: pointer;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  isForgotPasswordModalOpen = false;
  resetEmail = '';
  
  private authService = inject(AuthService);
  
  async login(form: NgForm): Promise<void> {
    if (form.invalid) {
      form.controls['email']?.markAsTouched();
      form.controls['password']?.markAsTouched();
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
    } catch (error: any) {
      this.errorMessage = error.message; 
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

  openForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = true;
  }

  closeForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = false;
  }

  async resetPassword(): Promise<void> {
    if (!this.resetEmail) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading = true;
    try {
      await this.authService.forgotPassword(this.resetEmail);
      alert('Password reset email sent. Please check your inbox.');
      this.closeForgotPasswordModal();
    } catch (error) {
      console.error('Error resetting password:', error);
      this.errorMessage = 'Failed to send password reset email. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}