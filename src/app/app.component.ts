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
    .global-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #eee;
      border-top: 5px solid #EC6408;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg);}
      100% { transform: rotate(360deg);}
    }
  `]
})
export class AppComponent {
  private authService = inject(AuthService);
  authReady = false;

  constructor() {
    this.authService.authReady$.subscribe(ready => {
      this.authReady = ready;
    });
  }
}