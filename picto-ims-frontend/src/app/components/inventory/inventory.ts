import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, SidebarComponent],
  template: `
    <body>
      <div class="div-container">
        <div class="navbar"><app-sidebar></app-sidebar></div>

        <div class="main-content">
          <header class="top-header">
            <div class="header-left">
              <h2>Inventory</h2>
            </div>
            <div class="header-right">
              <span class="welcome-text">Welcome, {{ getDisplayName() }}!</span>
            </div>
          </header>
        </div>
      </div>
    </body>
      `,
  styles: [`
    @font-face {
      font-family: 'Montserrat';
      src: url('/assets/fonts/Montserrat.ttf') format('truetype');
    }

    body {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: 'Montserrat';
    }

    .div-container {
      display: flex;
      min-height: 100vh;
      flex-direction: row;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f3f4f6;
    }

    .loading-spinner {
      text-align: center;
      color: #666;
    }

    .loading-spinner mat-icon {
      font-size: 14px;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .main-content { 
      margin-left: 220px; 
      background: #f3f4f6; 
      min-height: 100vh; 
      display: flex; 
      flex-direction: column; 
      flex: 1;
    }

    .top-header { 
      height: 60px; 
      background: white; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 0 24px; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border-bottom: 1px solid #e5e7eb;
    }

    .header-left h2 {
      margin: 0;
      color: #1f2937;
      font-size: 1.5rem;
    }

    .welcome-text {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .content-area {
      flex: 1;
      padding: 24px;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .div-container {
        flex-direction: row;
      }

      .main-content {
        margin-left: 0;
        display: flex;
      }

      .table-controls {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-field {
        width: 100%;
      }
    }
  `]
})

export class Inventory {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);
  isInitialized = false;
  
  private subscriptions: Subscription = new Subscription();

  async ngOnInit() {
    try {
      // Wait for auth service to initialize
      await this.authService.waitForInitialization();

      // Check authentication
      if (!this.authService.isLoggedIn()) {
        console.log('User not logged in, redirecting to login');
        this.router.navigate(['/login']);
        return;
      }

      // Subscribe to current user changes
      const userSub = this.authService.currentUser$.subscribe(user => {
        this.currentUser.set(user);
        console.log('Current user updated:', user);
      });
      this.subscriptions.add(userSub);

      // Subscribe to auth state changes
      const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
        if (!isAuth) {
          console.log('User authentication lost, redirecting to login');
          this.router.navigate(['/login']);
        }
      });
      this.subscriptions.add(authSub);

      // Refresh auth state to ensure we have latest data
      this.authService.refreshAuthState();

      this.isInitialized = true;
      console.log('Request initialized successfully');

    } catch (error) {
      console.error('Error initializing request:', error);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getDisplayName(): string {
    const user = this.currentUser();
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return user?.username || 'User';
  }

  getInitials(): string {
    const user = this.currentUser();
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'A';
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    console.log('Logout initiated from request');
    this.authService.logout();
    // Navigation is handled by the auth service
  }
}
