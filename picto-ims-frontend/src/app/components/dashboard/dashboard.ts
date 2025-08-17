import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';

export interface InventoryItem {
  item_id: string;
  item_name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  status: string;
  date_added: string;
  selected?: boolean;
}

const INVENTORY_DATA: InventoryItem[] = [
  {item_id: '101', item_name: 'Ergonomic Office Chair', description: 'Comfortable office chair with adjustable height and lumbar support', category: 'Office Furniture', quantity: 15, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-12'},
  {item_id: '11', item_name: 'Ergonomic Office Chair', description: 'Comfortable office chair', category: 'Office Furniture', quantity: 15, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-12'},
  {item_id: '4', item_name: 'Office Desk', description: 'Wooden office desk', category: 'Office Furniture', quantity: 10, unit: 'pcs', location: 'Main Office', status: 'Available', date_added: '2025-08-13'},
  {item_id: '5', item_name: 'Projector', description: 'HD projector for meetings', category: 'IT Equipment', quantity: 5, unit: 'pcs', location: 'Conference Room', status: 'Available', date_added: '2025-08-13'},
  {item_id: '6', item_name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', category: 'IT Equipment', quantity: 25, unit: 'pcs', location: 'IT Office', status: 'Available', date_added: '2025-08-12'},
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    RouterOutlet,
    MatSlideToggleModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    SidebarComponent
  ],
  template: `
  <div class="layout">
    <app-sidebar
      class="sidebar"
      [class.collapsed]="isCollapsed"
      (toggle)="isCollapsed = !isCollapsed">
    </app-sidebar>

    <div class="content">
      <header class="top-header">
        <div class="header-left">
          <h2>Dashboard</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="headerr-img">
        </div>
      </header>

      <div class="content-area">
        <div class="table-section">
          <div class="table-controls">
            <div class="controls-left">
              <button mat-stroked-button class="export-btn">
                Export
              </button>
              <button mat-stroked-button class="add-btn">
                Add
              </button>
              <button mat-stroked-button class="add-btn">
                Edit
              </button>
              <button mat-stroked-button class="add-btn">
                Delete
              </button>
            </div>
            <div class="controls-right">
              <mat-form-field appearance="outline" class="search-field">
                <input matInput placeholder="Search.." (input)="onSearch($event)">
              </mat-form-field>
            </div>

            <div class="table-container">
              <table mat-table [dataSource]="dataSource" class="data-table">
                <ng-container matColumnDef="item_name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let element">{{element.item_name}}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let element">{{element.description}}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let element">{{element.category}}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let element">{{element.quantity}}</td>
                </ng-container>

                <ng-container matColumnDef="unit">
                  <th mat-header-cell *matHeaderCellDef>Unit</th>
                  <td mat-cell *matCellDef="let element">{{element.unit}}</td>
                </ng-container>

                <ng-container matColumnDef="location">
                  <th mat-header-cell *matHeaderCellDef>Location</th>
                  <td mat-cell *matCellDef="let element">{{element.location}}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="status-badge" [class.available]="element.status==='Available'" [class.unavailable]="element.status!=='Available'">
                      {{element.status}}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="date_added">
                  <th mat-header-cell *matHeaderCellDef>Date Added</th>
                  <td mat-cell *matCellDef="let element">{{element.date_added}}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.selected-row]="row.selected"></tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    @font-face {
      font-family: 'Montserrat';
      src: url('/assets/fonts/Montserrat.ttf') format('truetype');
    }

    .layout {
      display: flex;
      height: 100vh;
      transition: all 0.3s ease;
    }

    .content {
      flex: 1;                    /* always take remaining space */
      padding: 10px;
      transition: all 0.3s ease;  /* smooth resize */
      width: 100%;
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

    .headerr-img {
      width: auto;
      height: 50px;
    }
      
    .content-area {
      flex: 1;
      padding: 24px;
    }

    .table-section { 
      background: white; 
      border-radius: 12px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      overflow: hidden;
      border: 1px solid #e5e7eb;
    }

    .table-controls { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      background: #fafbfc;
    }

    .controls-left {
      display: flex;
      gap: 8px;
    }

    .controls-left button {
      font-size: 0.875rem;
      padding: 8px 16px;
    }

    .export-btn {
      color: #059669;
      border-color: #059669;
    }

    .add-btn {
      color: #3b82f6;
      border-color: #3b82f6;
    }

    .search-field {
      width: 300px;
    }

    .table-container {
      overflow-x: auto;
    }

    .data-table { 
      width: 100%; 
      border-spacing: 0; 
      font-size: 0.875rem; 
    }

    .data-table th { 
      background: #f9fafb; 
      padding: 16px 12px; 
      font-weight: 600;
      text-align: left;
      border-bottom: 2px solid #e5e7eb;
      color: #374151;
    }

    .data-table td { 
      padding: 12px; 
      border-bottom: 1px solid #f3f4f6;
    }

    .status-badge { 
      padding: 4px 12px; 
      border-radius: 16px; 
      font-size: 0.75rem; 
      font-weight: 600; 
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.available { 
      background: #d1fae5; 
      color: #065f46; 
    }

    .status-badge.unavailable { 
      background: #fee2e2; 
      color: #991b1b; 
    }

    .selected-row { 
      background-color: #eff6ff !important; 
    }

    .data-table tr:hover {
      background-color: #f9fafb;
    }

    .selected-row:hover {
      background-color: #dbeafe !important;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
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

export class Dashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);

  isCollapsed = false;

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  currentUser = signal<User | null>(null);
  searchTerm = signal('');
  displayedColumns: string[] = ['select','item_id','item_name','description','category','quantity','unit','location','status','date_added'];
  dataSource: InventoryItem[] = [...INVENTORY_DATA];
  originalDataSource: InventoryItem[] = [...INVENTORY_DATA];
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
      console.log('Dashboard initialized successfully');

    } catch (error) {
      console.error('Error initializing dashboard:', error);
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
    console.log('Logout initiated from dashboard');
    this.authService.logout();
    // Navigation is handled by the auth service
  }

  onSearch(event: any): void {
    const value = event.target.value.toLowerCase().trim();
    this.searchTerm.set(value);
    
    if (!value) {
      this.dataSource = [...this.originalDataSource];
      return;
    }

    this.dataSource = this.originalDataSource.filter(item =>
      item.item_name.toLowerCase().includes(value) ||
      item.description.toLowerCase().includes(value) ||
      item.category.toLowerCase().includes(value) ||
      item.location.toLowerCase().includes(value) ||
      item.status.toLowerCase().includes(value) ||
      item.item_id.toLowerCase().includes(value)
    );
  }

  isAllSelected(): boolean {
    return this.dataSource.length > 0 && this.dataSource.every(row => row.selected);
  }

  isIndeterminate(): boolean {
    const selectedCount = this.dataSource.filter(row => row.selected).length;
    return selectedCount > 0 && selectedCount < this.dataSource.length;
  }

  toggleAllSelection(): void {
    const allSelected = this.isAllSelected();
    this.dataSource.forEach(row => row.selected = !allSelected);
  }

  getSelectedCount(): number {
    return this.dataSource.filter(row => row.selected).length;
  }
}