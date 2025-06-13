import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PollService } from '../../../services/poll.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model'; 

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
            <label for="category">Category</label>
            <select 
              id="category" 
              name="category" 
              class="form-control" 
              [(ngModel)]="category" 
              (change)="onCategoryChange($event)"
              required
            >
              <option value="" disabled>Select a category</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
              <option value="custom">+ Add New Category</option>
            </select>
          </div>
          
          <div *ngIf="isAddingCategory" class="form-group">
            <label for="newCategory">New Category</label>
            <input 
              type="text" 
              id="newCategory" 
              class="form-control" 
              [(ngModel)]="newCategory" 
              name="newCategory" 
              placeholder="Enter new category"
            >
            <button 
              type="button" 
              class="btn btn-accent" 
              style="margin-top: 10px;"
              (click)="addCategory()"
            >
              Add Category
            </button>
          </div>

          <div class="form-group">
            <label for="isAnonymous">Poll Type</label>
            <div class="toggle-container">
              <label class="switch">
                <input 
                  type="checkbox" 
                  id="isAnonymous" 
                  name="isAnonymous"
                  [(ngModel)]="isAnonymous"
                >
                <span class="slider round"></span>
              </label>
              <span class="toggle-label">{{ isAnonymous ? 'Anonymous Poll' : 'Non-Anonymous Poll' }}</span>
            </div>
          </div>
          
          <div *ngIf="categoryAddedMessage" class="alert alert-success">
            {{ categoryAddedMessage }}
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
    
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 24px;
      margin-right: 10px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 24px;
    }

    .slider:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--primary-color);
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .toggle-label {
      font-size: 0.9rem;
      color: #333;
      vertical-align: middle;
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
  category = ''; 
  categories: Category[] = []; 
  isAnonymous = false; 
  errorMessage = '';
  isLoading = false;
  isAddingCategory = false; 
  isCustomCategory = false; 
  newCategory = '';
  categoryAddedMessage = '';

  private pollService = inject(PollService);
  private router = inject(Router);
  private categoryService = inject(CategoryService); 

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(cats => {
      this.categories = cats;
    });
  }

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
  
  onCategoryChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.isAddingCategory = selectedValue === 'custom';
  }

  async addCategory(): Promise<void> {
    if (this.newCategory.trim()) {
      try {
        await this.categoryService.addCategory(this.newCategory.trim());
        this.category = this.newCategory.trim();
        this.isCustomCategory = true;
        this.categoryAddedMessage = `Category "${this.newCategory}" has been added successfully!`;
        this.newCategory = '';
        this.isAddingCategory = false;
        setTimeout(() => { this.categoryAddedMessage = ''; }, 3000);
      } catch (error) {
        this.errorMessage = 'Failed to add category. Please try again.';
      }
    } else {
      alert('Please enter a category before adding it.');
    }
  }

  async createPoll(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    try {
      const validOptions = this.options.filter(option => option.trim());
  
      const isCustomCategory = this.isCustomCategory;
  
      const pollId = await this.pollService.createPoll(
        this.question,
        validOptions,
        this.isAnonymous,
        this.category,
        isCustomCategory
      );
  
      this.router.navigate(['/polls', pollId]);
    } catch (error) {
      console.error('Error creating poll:', error);
      this.errorMessage = 'Failed to create poll. Please try again.';
    } finally {
      this.isLoading = false;
      this.isCustomCategory = false; 
    }
  }
  
  cancel(): void {
    this.router.navigate(['/polls']);
  }
}