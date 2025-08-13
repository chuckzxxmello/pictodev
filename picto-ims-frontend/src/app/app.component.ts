import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <div class="debug-info" *ngIf="showDebug">
        <p>Current Route: {{ currentRoute }}</p>
        <p>Is Authenticated: {{ isAuthenticated }}</p>
      </div>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f5f5f5;
    }
    .debug-info {
      position: fixed;
      top: 10px;
      right: 10px;
      background: #fff;
      padding: 10px;
      border: 1px solid #ccc;
      font-size: 12px;
      z-index: 1000;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'PICTO IMS';
  showDebug = true; // Set to false to hide debug info
  currentRoute = '';
  isAuthenticated = false;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
      console.log('Navigated to:', event.url);
    });

    // Track auth changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      console.log('Auth state changed:', isAuth);
    });
  }
}