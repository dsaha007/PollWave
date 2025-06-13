import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUserService } from '../../../app/services/admin-user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card">
        <h2>Manage Users</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Display Name</th>
              <th>Status</th>
              <th>Ban/Unban</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.email }}</td>
              <td>{{ user.displayName }}</td>
              <td>
                <span [class.banned]="user.banned"> 
                  {{ user.banned ? 'Banned' : 'Active' }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-outline danger" 
                  *ngIf="!user.banned" 
                  (click)="banUser(user)"
                >Ban</button>
                <button 
                  class="btn btn-outline" 
                  *ngIf="user.banned" 
                  (click)="unbanUser(user)"
                >Unban</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .banned { color: var(--danger-color); font-weight: bold; }
    .table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; }
  `]
})
export class AdminUsersComponent implements OnInit {
  private adminUserService = inject(AdminUserService);
  users: User[] = [];

  ngOnInit() {
    this.adminUserService.getAllUsers().subscribe(users => this.users = users);
  }

  async banUser(user: User) {
    if (user.uid) {
      await this.adminUserService.setUserBanned(user.uid, true);
      user.banned = true;
    }
  }

  async unbanUser(user: User) {
    if (user.uid) {
      await this.adminUserService.setUserBanned(user.uid, false);
      user.banned = false;
    }
  }
}