import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <h2>PollWave</h2>
            <p>Create and share interactive polls with real-time results</p>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/polls">Explore Polls</a></li>
                <li><a href="/polls/create">Create Poll</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h3>Support</h3>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} PollWave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--primary-color);
      color: var(--light-text);
      padding: 40px 0 20px;
      margin-top: 40px;
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    
    .footer-logo h2 {
      font-size: 24px;
      margin: 0 0 10px;
    }
    
    .footer-logo p {
      font-size: 14px;
      opacity: 0.8;
      max-width: 300px;
    }
    
    .footer-links {
      display: flex;
      gap: 60px;
    }
    
    .footer-col h3 {
      font-size: 16px;
      margin: 0 0 15px;
      color: var(--accent-color);
    }
    
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .footer-col li {
      margin-bottom: 8px;
    }
    
    .footer-col a {
      color: var(--light-text);
      text-decoration: none;
      font-size: 14px;
      opacity: 0.8;
      transition: opacity 0.3s ease;
    }
    
    .footer-col a:hover {
      opacity: 1;
      text-decoration: underline;
    }
    
    .footer-bottom {
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      font-size: 14px;
      opacity: 0.7;
    }
    
    @media (max-width: 768px) {
      .footer-content {
        flex-direction: column;
      }
      
      .footer-logo {
        margin-bottom: 30px;
      }
      
      .footer-links {
        gap: 30px;
      }
    }
    
    @media (max-width: 480px) {
      .footer-links {
        flex-direction: column;
        gap: 20px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
}