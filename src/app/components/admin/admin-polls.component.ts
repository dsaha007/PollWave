import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { Poll } from '../../models/poll.model';
import { AdminUserService } from '../../services/admin-user.service';
import { User } from '../../models/user.model';
import { ReportService } from '../../services/report.service';
import { Report } from '../../models/report.model';

@Component({
  selector: 'app-admin-polls',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="card">
        <h2>Manage Polls</h2>
        <div *ngIf="isLoading" class="spinner"></div>
        <table class="table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th>Question</th>
              <th>Category</th>
              <th>Status</th>
              <th>Votes</th>
              <th>Created By</th>
              <th>Created At</th>
              <th>Reports</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let poll of polls">
              <td>{{ poll.question }}</td>
              <td>{{ poll.category }}</td>
              <td>
                <span [class.active]="poll.isActive" [class.closed]="!poll.isActive">
                  {{ poll.isActive ? 'Active' : 'Closed' }}
                </span>
              </td>
              <td>{{ poll.totalVotes || 0 }}</td>
              <td>{{ getUserName(poll.createdBy) }}</td>
              <td>{{ poll.createdAt | date:'medium' }}</td>
              <td>
                <button *ngIf="reports[poll.id!]?.length" class="btn btn-outline danger" (click)="viewReports(poll)">
                  {{ reports[poll.id!].length }} Report(s)
                </button>
                <span *ngIf="!reports[poll.id!] || !reports[poll.id!].length">0</span>
              </td>
              <td>
                <a class="btn btn-outline" [routerLink]="['/polls', poll.id]">View Poll</a>
                <button 
                  class="btn btn-outline" 
                  (click)="toggleStatus(poll)" 
                  [disabled]="isToggling[poll.id!]">
                  {{ poll.isActive ? 'Close' : 'Reopen' }}
                </button>
                <button 
                  class="btn btn-outline danger" 
                  (click)="deletePoll(poll)" 
                  [disabled]="isDeleting[poll.id!]">
                  {{ isDeleting[poll.id!] ? 'Deleting...' : 'Delete' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .active { color: var(--success-color); font-weight: bold; }
    .closed { color: var(--danger-color); font-weight: bold; }
    .table { width: 100%; border-collapse: collapse; }
    th, td { padding: 8px 12px; border-bottom: 1px solid #eee; }
    th { background: #f5f5f5; }
    .danger { color: var(--danger-color); border-color: var(--danger-color); }
    .danger:hover { background: var(--danger-color); color: #fff; }
  `]
})
export class AdminPollsComponent implements OnInit {
  private pollService = inject(PollService);
  private adminUserService = inject(AdminUserService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  polls: Poll[] = [];
  users: User[] = [];
  reports: { [pollId: string]: Report[] } = {};
  isLoading = true;
  isDeleting: { [key: string]: boolean } = {};
  isToggling: { [key: string]: boolean } = {};

  ngOnInit() {
    this.loadUsers();
    this.loadPolls();
  }

  loadUsers() {
    this.adminUserService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  getUserName(uid: string): string {
    const user = this.users.find(u => u.uid === uid);
    return user?.displayName || 'Unknown';
  }

  loadPolls() {
    this.isLoading = true;
    this.pollService.getPolls().subscribe({
      next: (polls) => {
        this.polls = polls;
        this.isLoading = false;
        // Fetch reports for each poll
        polls.forEach(poll => {
          this.reportService.getReportsForPoll(poll.id!).subscribe(reports => {
            this.reports[poll.id!] = reports;
          });
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  async toggleStatus(poll: Poll) {
    if (!poll.id) return;
    this.isToggling[poll.id] = true;
    try {
      await this.pollService.togglePollStatus(poll.id);
    } finally {
      this.isToggling[poll.id] = false;
    }
  }

  async deletePoll(poll: Poll) {
    if (!poll.id) return;
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) return;
    this.isDeleting[poll.id] = true;
    try {
      await this.pollService.deletePoll(poll.id);
    } finally {
      this.isDeleting[poll.id] = false;
    }
  }

  viewReports(poll: Poll) {
    const reportList = (this.reports[poll.id!] || [])
      .map(r => {
        // Convert Firestore Timestamp to JS Date if needed
        let date: Date;
        const createdAt: any = r.createdAt;
        if (createdAt instanceof Date) {
          date = createdAt;
        } else if (createdAt && typeof createdAt.toDate === 'function') {
          date = createdAt.toDate();
        } else {
          date = new Date(createdAt);
        }
        return `By: ${r.reportedBy}\nReason: ${r.reason}\nDate: ${date.toLocaleString()}`;
      })
      .join('\n\n');
    alert(reportList || 'No reports for this poll.');
  }
}