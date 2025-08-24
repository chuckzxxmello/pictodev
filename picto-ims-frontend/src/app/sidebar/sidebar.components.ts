import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  currentUser = signal<User | null>(null);

  isExpanded = false; // collapsed by default

  menuLinks = [
    { path: '/userprofile', label: 'Users', icon: 'assets/icons/user.png' },
    { path: '/dashboard', label: 'Dashboard', icon: 'assets/icons/home.png' },
    { path: '/inventory', label: 'Inventory', icon: 'assets/icons/inventory.png' },
    { path: '/requisitions', label: 'Requisitions', icon: 'assets/icons/slip.png' },
    { path: '/archive', label: 'Archive', icon: 'assets/icons/archive.png' }
  ];

  @Output() expandChange = new EventEmitter<boolean>();

  constructor() {
    // ✅ listen for logged-in user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  expandSidebar() {
    this.isExpanded = true;
    this.expandChange.emit(this.isExpanded);
  }

  collapseSidebar() {
    this.isExpanded = false;
    this.expandChange.emit(this.isExpanded);
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }

  /** ✅ Role-based menu filtering */
  canShow(link: any): boolean {
    const user = this.currentUser();
    if (!user) return false;

    switch (user.role) {
      case 'Admin':
        return true; // show all
      case 'Manager':
        return link.path !== '/userprofile'; // hide "Users"
      case 'User':
        return ['/dashboard', '/inventory', '/requisitions'].includes(link.path);
      default:
        return false;
    }
  }
}