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
      <img class="arrow-image" src="../../../../assets/up-arrow.png" alt="⬆" />
    </button>
  `,
  styles: [`
    .back-to-top-button {
      display: flex;
      justify-content: center;
      position: fixed;
      bottom: 20px;
      right: 20px;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.3s ease;
      z-index: 100;
      font-size: 1.5rem;
      align-items:center;
    }
    .arrow-image{
      width: 100%;
      height: 100%;
    }
    .back-to-top-button:hover {
      opacity: 1;
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