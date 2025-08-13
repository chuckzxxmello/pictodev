import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <!-- Sidebar -->
    <nav class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-title">PICTO IMS</div>
        <div class="sidebar-user">{{ currentUser()?.email || currentUser()?.username }}</div>
      </div>
      
      <ul class="sidebar-menu">
        <li>
          <a [routerLink]="['/dashboard']" 
             [class.active]="isActiveRoute('/dashboard')"
             class="menu-item">
            📊 Dashboard
          </a>
        </li>
        <li>
          <a [routerLink]="['/inventory']" 
             [class.active]="isActiveRoute('/inventory')"
             class="menu-item">
            📦 Inventory
          </a>
        </li>
        <li class="has-submenu" [class.open]="isSubmenuOpen()">
          <a href="#" class="menu-toggle" (click)="toggleSubmenu($event)">📋 RF & RS</a>
          <ul class="submenu">
            <li>
              <a [routerLink]="['/requisitions']" 
                 [class.active]="isActiveRoute('/requisitions')"
                 class="menu-item">
                Requisition Forms
              </a>
            </li>
            <li>
              <a [routerLink]="['/requests']" 
                 [class.active]="isActiveRoute('/requests')"
                 class="menu-item">
                Request Forms
              </a>
            </li>
            <li>
              <a [routerLink]="['/transfers']" 
                 [class.active]="isActiveRoute('/transfers')"
                 class="menu-item">
                Transfers
              </a>
            </li>
            <li>
              <a [routerLink]="['/repairs']" 
                 [class.active]="isActiveRoute('/repairs')"
                 class="menu-item">
                PC Repair Tracker
              </a>
            </li>
          </ul>
        </li>
        <li *ngIf="hasAdminRole()">
          <a [routerLink]="['/users']" 
             [class.active]="isActiveRoute('/users')"
             class="menu-item">
            👥 User Management
          </a>
        </li>
        <li>
          <a href="#" (click)="logout()" class="menu-item">
            🚪 Logout
          </a>
        </li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <h1 class="page-title">{{ getPageTitle() }}</h1>
        <div class="header-actions">
          <div class="currency-selector">
            <span>💱</span>
            <span>Currency: PHP</span>
          </div>
          <div class="user-info">
            <span>{{ currentUser()?.fullName }}</span>
            <span class="user-role">({{ currentUser()?.role }})</span>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="content-area">
        <router-outlet></router-outlet>
      </div>
    </main>
  `,
  styles: [`
    /* Sidebar */
    .sidebar {
      width: 220px;
      height: 100vh;
      background-color: #2c3e50;
      color: #ecf0f1;
      position: fixed;
      top: 0;
      left: 0;
      overflow-y: auto;
      box-shadow: 2px 0 5px rgba(0,0,0,0.2);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 20px 15px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }

    .sidebar-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 8px;
      letter-spacing: 1.5px;
      user-select: none;
    }

    .sidebar-user {
      font-size: 0.9rem;
      font-weight: 500;
      color: #bdc3c7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Sidebar Menu */
    .sidebar-menu {
      list-style: none;
      padding: 0;
      margin: 0;
      flex-grow: 1;
    }

    .sidebar-menu li {
      position: relative;
    }

    .sidebar-menu .menu-item {
      display: block;
      padding: 12px 20px;
      color: #ecf0f1;
      text-decoration: none;
      font-size: 1rem;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.25s ease;
      white-space: nowrap;
    }

    .sidebar-menu .menu-item:hover {
      background-color: #34495e;
      color: #ffffff;
    }

    .sidebar-menu .menu-item.active {
      background-color: #1abc9c;
      color: white;
      font-weight: 600;
    }

    /* Submenu */
    .has-submenu > .menu-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      cursor: pointer;
      font-size: 1rem;
      color: #ecf0f1;
      border: none;
      background: none;
      width: 100%;
      user-select: none;
      transition: background-color 0.25s ease;
    }

    .has-submenu > .menu-toggle:hover {
      background-color: #34495e;
    }

    .has-submenu.open > .menu-toggle {
      background-color: #16a085;
      font-weight: 600;
    }

    .submenu {
      list-style: none;
      padding-left: 10px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
      background-color: #34495e;
    }

    .has-submenu.open > .submenu {
      max-height: 500px; /* large enough to show all submenu items */
    }

    .submenu li {
      border-left: 3px solid transparent;
    }

    .submenu li .menu-item {
      padding: 10px 30px;
      font-size: 0.95rem;
      color: #ecf0f1;
    }

    .submenu li .menu-item:hover {
      background-color: #3d566e;
    }

    .submenu li .menu-item.active {
      background-color: #1abc9c;
      font-weight: 600;
      border-left: 3px solid #16a085;
      color: white;
    }

    /* Main content */
    .main-content {
      margin-left: 220px;
      padding: 20px 30px;
      min-height: 100vh;
      background-color: #f5f7fa;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    /* Top header */
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;
      padding-bottom: 12px;
      margin-bottom: 20px;
      user-select: none;
    }

    .page-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #34495e;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 20px;
      align-items: center;
      font-size: 0.9rem;
      color: #7f8c8d;
    }

    .currency-selector {
      display: flex;
      align-items: center;
      gap: 6px;
      background-color: #ecf0f1;
      padding: 5px 10px;
      border-radius: 4px;
      color: #34495e;
      font-weight: 600;
      user-select: none;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #2c3e50;
    }

    .user-role {
      font-style: italic;
      color: #95a5a6;
      font-weight: 400;
    }

    /* Content area */
    .content-area {
      background: white;
      padding: 20px;
      border-radius: 6px;
      box-shadow: 0 0 12px rgba(0,0,0,0.05);
      min-height: 60vh;
    }

    /* Scrollbar for sidebar */
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }
    .sidebar::-webkit-scrollbar-thumb {
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }
  `]
})
export class Inventory {
  private router = inject(Router);
  private authService = inject(AuthService);

  isSubmenuOpen = signal(false);
  currentUser = signal<User | null>(null);

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  toggleSubmenu(event: Event) {
    event.preventDefault();
    this.isSubmenuOpen.set(!this.isSubmenuOpen());
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  hasAdminRole(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.startsWith('/dashboard')) return 'Dashboard';
    if (url.startsWith('/inventory')) return 'Inventory';
    if (url.startsWith('/requisitions')) return 'Requisition Forms';
    if (url.startsWith('/requests')) return 'Request Forms';
    if (url.startsWith('/transfers')) return 'Transfers';
    if (url.startsWith('/repairs')) return 'PC Repair Tracker';
    if (url.startsWith('/users')) return 'User Management';
    return '';
  }
}
