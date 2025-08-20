import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InventoryService, PictoInventory } from '../../services/inventory.service';
import { RequisitionsService, Requisition } from '../../services/requisitions.service';
import { User } from '../../models';
import { Subscription, firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    RouterOutlet, 
    SidebarComponent, 
    MatTableModule, 
    MatButtonModule,
    MatSelectModule,
    FormsModule
  ],
  template: `
  <div class="layout">
    <app-sidebar [class.collapsed]="isCollapsed" (toggle)="isCollapsed = !isCollapsed"></app-sidebar>

    <div class="content">
      <header class="top-header">
        <div class="header-left">
          <h2>Dashboard</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="header-img">
        </div>
      </header>

      <div class="content-area">
        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          
          <!-- Recent Items Section -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Recent Items</h3>
              <div class="filter-controls">
                <select [(ngModel)]="selectedPeriod" (change)="filterRecentItems()" class="period-select">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
                <button mat-stroked-button class="export-btn" (click)="exportRecentCSV()">Export</button>
              </div>
            </div>
            <div class="table-container">
              <table mat-table [dataSource]="filteredRecentItems()" class="data-table">
                
                <ng-container matColumnDef="item_id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let element">{{element.itemId}}</td>
                </ng-container>

                <ng-container matColumnDef="itemName">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let element">{{element.itemName}}</td>
                </ng-container>

                <ng-container matColumnDef="serialNumber">
                  <th mat-header-cell *matHeaderCellDef>Serial Number</th>
                  <td mat-cell *matCellDef="let element">{{element.serialNumber}}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let element">{{element.category}}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Qty</th>
                  <td mat-cell *matCellDef="let element">{{element.quantity}}</td>
                </ng-container>

                <ng-container matColumnDef="location">
                  <th mat-header-cell *matHeaderCellDef>Location</th>
                  <td mat-cell *matCellDef="let element">{{element.location}}</td>
                </ng-container>

                <ng-container matColumnDef="dateAdded">
                  <th mat-header-cell *matHeaderCellDef>Date Added</th>
                  <td mat-cell *matCellDef="let element">{{element.dateAdded | date:'mediumDate'}}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="recentItemsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: recentItemsColumns;"></tr>
              </table>
              
              <div *ngIf="filteredRecentItems().length === 0" class="no-data">
                No recent items found for the selected period.
              </div>
            </div>
          </div>

          <!-- Stock Alerts Section -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Stock Alerts</h3>
              <div class="filter-controls">
                <span class="alert-count">{{lowStockItems().length}} items low in stock</span>
                <button mat-stroked-button class="export-btn" (click)="exportStockAlertsCSV()">Export</button>
              </div>
            </div>
            <div class="table-container">
              <table mat-table [dataSource]="lowStockItems()" class="data-table">
                
                <ng-container matColumnDef="item_id">
                  <th mat-header-cell *matHeaderCellDef>ID</th>
                  <td mat-cell *matCellDef="let element">{{element.itemId}}</td>
                </ng-container>

                <ng-container matColumnDef="itemName">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let element">{{element.itemName}}</td>
                </ng-container>

                <ng-container matColumnDef="serialNumber">
                  <th mat-header-cell *matHeaderCellDef>Serial Number</th>
                  <td mat-cell *matCellDef="let element">{{element.serialNumber}}</td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Category</th>
                  <td mat-cell *matCellDef="let element">{{element.category}}</td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="quantity-header">Qty <span class="low-stock-indicator">⚠️</span></span>
                  </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="low-stock-qty">{{element.quantity}}</span>
                  </td>
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
                    <span class="status-badge"
                          [class.available]="element.status==='Available'"
                          [class.unavailable]="element.status!=='Available'">
                      {{element.status}}
                    </span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="stockAlertsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: stockAlertsColumns;" class="alert-row"></tr>
              </table>

              <div *ngIf="lowStockItems().length === 0" class="no-data">
                All items are well stocked! 🎉
              </div>
            </div>
          </div>

          <!-- Requisition Requests Section -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Recent Requisition Requests</h3>
              <div class="filter-controls">
                <span class="request-count">{{recentRequisitions().length}} recent requests</span>
                <button mat-stroked-button class="export-btn" (click)="exportRequisitionsCSV()">Export</button>
              </div>
            </div>
            <div class="table-container">
              <table mat-table [dataSource]="recentRequisitions()" class="data-table">
                
                <ng-container matColumnDef="rfId">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="highlighted-header">RF ID</span>
                  </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="highlighted-field">{{element.rfId}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="requesterName">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="highlighted-header">Requester</span>
                  </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="highlighted-field">{{element.requesterName}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let element">{{element.department}}</td>
                </ng-container>

                <ng-container matColumnDef="purpose">
                  <th mat-header-cell *matHeaderCellDef>Purpose</th>
                  <td mat-cell *matCellDef="let element">{{element.purpose}}</td>
                </ng-container>

                <ng-container matColumnDef="dateRequested">
                  <th mat-header-cell *matHeaderCellDef>Date Requested</th>
                  <td mat-cell *matCellDef="let element">{{element.dateRequested | date:'mediumDate'}}</td>
                </ng-container>

                <ng-container matColumnDef="checkedByName">
                  <th mat-header-cell *matHeaderCellDef>Checked By</th>
                  <td mat-cell *matCellDef="let element">{{element.checkedByName || 'Pending'}}</td>
                </ng-container>

                <ng-container matColumnDef="approvedByName">
                  <th mat-header-cell *matHeaderCellDef>Approved By</th>
                  <td mat-cell *matCellDef="let element">{{element.approvedByName || 'Pending'}}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="requisitionsColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: requisitionsColumns;"></tr>
              </table>

              <div *ngIf="recentRequisitions().length === 0" class="no-data">
                No recent requisition requests found.
              </div>
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
      flex: 1;
      padding: 10px;
      transition: all 0.3s ease;
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

    .header-img {
      width: auto;
      height: 50px;
    }

    .content-area {
      padding: 24px;
      flex: 1;
      overflow-y: auto;
    }

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .dashboard-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f3f4f6;
      background: #f9fafb;
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .filter-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .period-select {
      padding: 6px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
    }

    .alert-count, .request-count {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .export-btn {
      font-size: 0.875rem !important;
      padding: 6px 16px !important;
    }

    .table-container {
      overflow-x: auto;
      max-height: 400px;
      overflow-y: auto;
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
      border-bottom: 2px solid #e5e7eb;
      text-align: left;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .data-table tr:hover {
      background-color: #f9fafb;
    }

    .alert-row {
      background-color: #fef3c7 !important;
    }

    .alert-row:hover {
      background-color: #fde68a !important;
    }

    .no-data {
      padding: 40px;
      text-align: center;
      color: #6b7280;
      font-style: italic;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-badge.available {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-badge.unavailable {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .low-stock-qty {
      color: #dc2626;
      font-weight: 600;
    }

    .quantity-header {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .low-stock-indicator {
      font-size: 14px;
    }

    .highlighted-header {
      color: #1d4ed8;
      font-weight: 700;
    }

    .highlighted-field {
      color: #1d4ed8;
      font-weight: 600;
      background-color: #eff6ff;
      padding: 4px 8px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        gap: 16px;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
      }

      .filter-controls {
        width: 100%;
        justify-content: space-between;
      }

      .content-area {
        padding: 16px;
      }
    }
  `]
})

export class Dashboard implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private requisitionsService = inject(RequisitionsService);
  private snackBar = inject(MatSnackBar);

  currentUser = signal<User | null>(null);
  isInitialized = false;
  isCollapsed = false;

  // Data sources
  allInventoryItems = signal<PictoInventory[]>([]);
  allRequisitions = signal<Requisition[]>([]);
  
  // Filter period for recent items
  selectedPeriod = 'month';

  // Table column definitions
  recentItemsColumns = ['item_id', 'itemName', 'serialNumber', 'category', 'quantity', 'location', 'dateAdded'];
  stockAlertsColumns = ['item_id', 'itemName', 'serialNumber', 'category', 'quantity', 'unit', 'location', 'status'];
  requisitionsColumns = ['rfId', 'requesterName', 'department', 'purpose', 'dateRequested', 'checkedByName', 'approvedByName'];

  private subscriptions: Subscription = new Subscription();

  // Computed signals for filtered data
  filteredRecentItems = computed(() => {
    const items = this.allInventoryItems();
    const now = new Date();
    let filterDate: Date;

    switch (this.selectedPeriod) {
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        filterDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return items
      .filter(item => {
        if (!item.dateAdded) return false;
        const itemDate = new Date(item.dateAdded);
        return itemDate >= filterDate;
      })
      .sort((a, b) => {
        if (!a.dateAdded || !b.dateAdded) return 0;
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      })
      .slice(0, 10); // Show only the 10 most recent
  });

  lowStockItems = computed(() => {
    return this.allInventoryItems()
      .filter(item => item.quantity < 5)
      .sort((a, b) => a.quantity - b.quantity); // Sort by lowest quantity first
  });

  recentRequisitions = computed(() => {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.allRequisitions()
      .filter(req => {
        if (!req.dateRequested) return false;
        const reqDate = new Date(req.dateRequested);
        return reqDate >= last30Days;
      })
      .sort((a, b) => {
        if (!a.dateRequested || !b.dateRequested) return 0;
        return new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime();
      })
      .slice(0, 15); // Show only the 15 most recent
  });

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

      // Load data
      await this.loadDashboardData();

      // Refresh auth state
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

  private async loadDashboardData() {
    try {
      // Load inventory items
      const inventory = await firstValueFrom(this.inventoryService.getAllInventory());
      this.allInventoryItems.set(inventory);

      // Load requisitions
      const requisitions = await firstValueFrom(this.requisitionsService.getAll());
      this.allRequisitions.set(requisitions);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.snackBar.open('Error loading dashboard data', 'OK', { duration: 3000 });
    }
  }

  filterRecentItems() {
    // This will trigger the computed signal to recalculate
    // No additional action needed since we're using computed signals
  }

  // Export functions
  exportRecentCSV() {
    const items = this.filteredRecentItems();
    if (!items.length) {
      this.snackBar.open('No recent items to export', 'OK', { duration: 2000 });
      return;
    }

    const headers = ['ID', 'Name', 'Serial Number', 'Category', 'Quantity', 'Location', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.itemId,
        item.itemName,
        item.serialNumber || '',
        item.category || '',
        item.quantity,
        item.location || '',
        item.dateAdded ? new Date(item.dateAdded).toLocaleDateString() : 'N/A'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    this.downloadCSV(csvContent, `recent_items_${this.selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportStockAlertsCSV() {
    const items = this.lowStockItems();
    if (!items.length) {
      this.snackBar.open('No stock alerts to export', 'OK', { duration: 2000 });
      return;
    }

    const headers = ['ID', 'Name', 'Serial Number', 'Category', 'Quantity', 'Unit', 'Location', 'Status'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.itemId,
        item.itemName,
        item.serialNumber || '',
        item.category || '',
        item.quantity,
        item.unit || '',
        item.location || '',
        item.status
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    this.downloadCSV(csvContent, `stock_alerts_${new Date().toISOString().split('T')[0]}.csv`);
  }

  exportRequisitionsCSV() {
    const requisitions = this.recentRequisitions();
    if (!requisitions.length) {
      this.snackBar.open('No recent requisitions to export', 'OK', { duration: 2000 });
      return;
    }

    const headers = ['RF ID', 'Requester', 'Department', 'Purpose', 'Date Requested', 'Checked By', 'Approved By'];
    const csvContent = [
      headers.join(','),
      ...requisitions.map(req => [
        req.rfId,
        req.requesterName,
        req.department,
        req.purpose || '',
        req.dateRequested ? new Date(req.dateRequested).toLocaleDateString() : 'N/A',
        req.checkedByName || 'Pending',
        req.approvedByName || 'Pending'
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    this.downloadCSV(csvContent, `recent_requisitions_${new Date().toISOString().split('T')[0]}.csv`);
  }

  private downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('CSV exported successfully', 'OK', { duration: 2000 });
  }

  // Utility methods from original dashboard
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
  }
}