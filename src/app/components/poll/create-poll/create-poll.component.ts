import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PollService } from '../../../services/poll.service';

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="create-poll-container">
        <h1>Create a New Poll</h1>
        
        @if (errorMessage) {
          <div class="alert alert-danger">
            {{ errorMessage }}
          </div>
        }
        
        <form (ngSubmit)="createPoll()" #pollForm="ngForm">
          <div class="form-group">
            <label for="question">Question</label>
            <input 
              type="text" 
              id="question" 
              name="question"
              class="form-control" 
              [(ngModel)]="question" 
              required
              minlength="5"
              #questionInput="ngModel"
              [class.is-invalid]="questionInput.invalid && questionInput.touched"
            >
            @if (questionInput.invalid && questionInput.touched) {
              <div class="error-message">
                Question must be at least 5 characters.
              </div>
            }
          </div>
          
          <div class="options-container">
            <label>Answer Options</label>
            
            @for (option of options; track $index) {
              <div class="option-row">
                <input 
                  type="text" 
                  class="form-control option-input" 
                  [(ngModel)]="options[$index]" 
                  [name]="'option' + $index" 
                  required
                  placeholder="Enter option"
                >
                @if (options.length > 2) {
                  <button 
                    type="button" 
                    class="btn-remove" 
                    (click)="removeOption($index)"
                  >
                    &times;
                  </button>
                }
              </div>
            }
          </div>
          
          <button 
            type="button" 
            class="btn btn-outline option-btn" 
            (click)="addOption()"
          >
            + Add Another Option
          </button>
          <div class="form-group">
            <label for="isAnonymous">Poll Type</label>
            <div class="toggle-container">
              <label>
                <input 
                  type="checkbox" 
                  id="isAnonymous" 
                  name="isAnonymous"
                  [(ngModel)]="isAnonymous"
                >
                Anonymous Poll
              </label>
            </div>
          </div>
          <div class="form-actions">
            <button 
              type="submit" 
              class="btn btn-accent" 
              [disabled]="!isFormValid() || isLoading"
            >
              @if (isLoading) {
                <span>Creating Poll...</span>
              } @else {
                <span>Create Poll</span>
              }
            </button>
            <button 
              type="button" 
              class="btn btn-outline" 
              (click)="cancel()"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .create-poll-container {
      max-width: 700px;
      margin: 40px auto;
      background-color: #FFFFFF;
      border-radius: var(--border-radius);
      box-shadow: var(--box-shadow);
      padding: 30px;
    }
    
    h1 {
      color: var(--primary-color);
      font-size: 1.8rem;
      margin-bottom: 24px;
      text-align: center;
    }
    
    .options-container {
      margin-bottom: 20px;
    }
    
    .option-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .option-input {
      flex: 1;
    }
    
    .btn-remove {
      background-color: var(--danger-color);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      font-size: 1.2rem;
      margin-left: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }
    
    .btn-remove:hover {
      background-color: #c82333;
    }
    
    .option-btn {
      margin-bottom: 24px;
      width: 100%;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .form-actions .btn {
      width: 48%;
    }
    
    @media (max-width: 576px) {
      .create-poll-container {
        padding: 20px;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .form-actions .btn {
        width: 100%;
        margin-bottom: 10px;
      }
    }
  `]
})
export class CreatePollComponent {
  question = '';
  options: string[] = ['', ''];
  isAnonymous = false; // New field for poll type
  errorMessage = '';
  isLoading = false;
  
  private pollService = inject(PollService);
  private router = inject(Router);
  
  addOption(): void {
    this.options.push('');
  }
  
  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.splice(index, 1);
    }
  }
  
  isFormValid(): boolean {
    if (!this.question || this.question.length < 5) {
      return false;
    }
    
    if (this.options.length < 2) {
      return false;
    }
    
    return !this.options.some(option => !option.trim());
  }
  
  async createPoll(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      const validOptions = this.options.filter(option => option.trim());
      
      const pollId = await this.pollService.createPoll(this.question, validOptions, this.isAnonymous);
      this.router.navigate(['/polls', pollId]);
    } catch (error) {
      console.error('Error creating poll:', error);
      this.errorMessage = 'Failed to create poll. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
  
  cancel(): void {
    this.router.navigate(['/polls']);
  }
}