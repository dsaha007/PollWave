import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-back-to-top',
  standalone: true,
  imports: [CommonModule],
  template: `<button
    *ngIf="showButton"
    (click)="scrollToTop()"
    class="back-to-top-button"
  >
    Back to Top
  </button>
  `,
  styles: [`
    .back-to-top-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--accent-color);
      color: white;
      border: none;
      border-radius: 50%;
      padding: 10px 15px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.3s ease;
      z-index: 100;
      font-size: 1.2rem;
    }

    .back-to-top-button:hover {
      opacity: 6;
    }
  `]
})
export class BackToTopComponent implements OnInit, OnDestroy {
  showButton = false;

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showButton = window.scrollY > 100;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}