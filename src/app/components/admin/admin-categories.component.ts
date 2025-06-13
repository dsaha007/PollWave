import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Manage Categories</h2>
        <form (ngSubmit)="addCategory()" class="form-group" style="display:flex;gap:10px;">
          <input class="form-control" [(ngModel)]="newCategory" name="newCategory" placeholder="New category" required>
          <button class="btn btn-accent" type="submit">Add</button>
        </form>
        <ul>
  <li *ngFor="let cat of categories; let i = index">
    <input
      [(ngModel)]="cat.name"
      [name]="'catName' + i"
      class="form-control"
      style="width:200px;display:inline-block;"
      [readonly]="editIndex !== i"
    >
    <button 
      class="btn btn-outline" 
      *ngIf="editIndex !== i" 
      (click)="editIndex = i"
    >Edit</button>
    <button 
      class="btn btn-accent" 
      *ngIf="editIndex === i" 
      (click)="saveCategory(cat, i)"
    >Save</button>
    <button class="btn btn-outline danger" (click)="deleteCategory(cat)">Delete</button>
  </li>
</ul>
      </div>
    </div>
  `,
  styles: [`
    h2 { color: var(--primary-color); margin-bottom: 20px; }
    ul { list-style: none; padding: 0; }
    li { margin-bottom: 10px; display: flex; align-items: center; gap: 10px; }
    .danger { color: var(--danger-color); border-color: var(--danger-color); }
    .danger:hover { background: var(--danger-color); color: #fff; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  categories: Category[] = [];
  newCategory = '';
  editIndex: number | null = null;

  ngOnInit() {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  async addCategory() {
    if (!this.newCategory.trim()) return;
    await this.categoryService.addCategory(this.newCategory.trim());
    this.newCategory = '';
  }

  async updateCategory(cat: Category) {
    if (!cat.id) return;
    await this.categoryService.updateCategory(cat.id, cat.name);
  }

  async deleteCategory(cat: Category) {
    if (!cat.id) return;
    if (confirm('Delete this category?')) {
      await this.categoryService.deleteCategory(cat.id);
    }
  }

  async saveCategory(cat: Category, i: number) {
    if (!cat.id) return;
    await this.categoryService.updateCategory(cat.id, cat.name);
    this.editIndex = null;
  }
}