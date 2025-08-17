import { Component, inject, signal } from '@angular/core';
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

  menuLinks = [
    {path:'/dashboard', label:'Dashboard', icon:'assets/icons/home.png'},
    {path:'/inventory', label:'Inventory', icon:'assets/icons/inventory.png'},
    {path:'/requests', label:'Requisition Form', icon:'assets/icons/form.png'},
    {path:'/requisitions', label:'Requisition Slip', icon:'assets/icons/slip.png'},
    {path:'/transfers', label:'Transfer In', icon:'assets/icons/in.png'},
    {path:'/repairs', label:'Transfer Out', icon:'assets/icons/out.png'}
  ];

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }
}
