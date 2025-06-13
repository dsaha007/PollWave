import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/shared/header/header.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { BackToTopComponent } from './components/shared/back-to-top/back-to-top.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BackToTopComponent
  ],
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <ng-container *ngIf="authReady; else loading">
          <router-outlet></router-outlet>
        </ng-container>
        <ng-template #loading>
          <div class="global-spinner">
            <div class="spinner"></div>
            <p>Loading...</p>
          </div>
        </ng-template>
      </main>
      <app-footer></app-footer>
      <app-back-to-top></app-back-to-top>
      <div *ngIf="showBannedModal" class="modal-overlay">
        <div class="modal-content">
          <h2 class="modal-title">You are banned</h2>
          <p>Your account has been banned by an administrator. You have been logged out.</p>
          <button class="btn btn-outline" (click)="closeBannedModal()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .main-content {
      flex: 1;
    }
  `]
})
export class AppComponent {
  private authService = inject(AuthService);
  authReady = false;
  showBannedModal = false;
  bannedHandled = false;

  constructor() {
    this.authService.authReady$.subscribe(ready => {
      this.authReady = ready;
    });
    this.authService.user$.subscribe(user => {
      if (user && user.banned && !this.bannedHandled) {
        this.bannedHandled = true;
        this.showBannedModal = true;
        setTimeout(() => {
          this.authService.logout();
        }, 2000); 
      }
    });
  }

  closeBannedModal() {
    this.showBannedModal = false;
  }
  
}
  
