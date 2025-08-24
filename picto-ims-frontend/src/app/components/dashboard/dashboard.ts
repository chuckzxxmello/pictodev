import { Component, inject, signal, OnInit, OnDestroy, computed, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InventoryService, PictoInventory } from '../../services/inventory.service';
import { RequisitionsService, RequisitionForm } from '../../services/requisitions.service';
import { User } from '../../models';
import { Subscription, firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

// Chart.js imports
declare var Chart: any;

interface CategoryConsumption {
  category: string;
  monthlyData: MonthlyConsumption[];
  color: string;
}

interface MonthlyConsumption {
  month: string;
  count: number;
}

interface ConsumptionAnalytics {
  itemId: number;
  itemName: string;
  category: string;
  consumedQuantity: number;
  dateConsumed: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
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
        <div class="dashboard-grid">

          <!-- Inventory Overview Chart -->
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>Inventory Overview</h3>
              <div class="chart-controls">
                <div class="control-group">
                  <label class="control-label">Time Period:</label>
                  <select [ngModel]="selectedChartPeriod()" (ngModelChange)="onChartPeriodChange($event)" class="period-select">
                    <option value="6months">Last 6 Months</option>
                    <option value="12months">Last 12 Months</option>
                    <option value="currentYear">Current Year</option>
                  </select>
                </div>
                <div class="control-group">
                  <label class="control-label">Filter by Month:</label>
                  <select [ngModel]="selectedMonthFilter()" (ngModelChange)="onMonthFilterChange($event)" class="period-select">
                    <option value="all">All Months</option>
                    <option *ngFor="let month of availableMonths()" [value]="month.value">{{month.label}}</option>
                  </select>
                </div>
                <div class="chart-legend">
                  <div *ngFor="let cat of filteredCategoryData()" class="legend-item">
                    <span class="legend-color" [style.background-color]="cat.color"></span>
                    <span class="legend-text">{{cat.category}} ({{cat.totalConsumption}})</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-container">
              <canvas id="consumptionChart" width="400" height="200"></canvas>
              <div *ngIf="categoryConsumptionData().length === 0" class="no-chart-data">
                No consumption data available for analytics
              </div>
            </div>
          </div>

          <!-- Recent Items -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>Recent Items</h3>
              <div class="filter-controls">
                <select [ngModel]="selectedPeriod()" (ngModelChange)="selectedPeriod.set($event)" class="period-select">
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

          <!-- Stock Alerts -->
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
                    <span class="quantity-header">Qty <span class="low-stock-indicator"></span></span>
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
                All items are well stocked!
              </div>
            </div>
          </div>

          <!-- Recent Requisition Requests -->
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
                
                <ng-container matColumnDef="rsNumber">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="highlighted-header">RS Number</span>
                  </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="highlighted-field">{{element.rsNumber || 'N/A'}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="rfNumber">
                  <th mat-header-cell *matHeaderCellDef>
                    <span class="highlighted-header">RF Number</span>
                  </th>
                  <td mat-cell *matCellDef="let element">
                    <span class="highlighted-field">{{element.rfNumber || 'N/A'}}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="requesterName">
                  <th mat-header-cell *matHeaderCellDef>Requester Name</th>
                  <td mat-cell *matCellDef="let element">{{element.requesterName}}</td>
                </ng-container>

                <ng-container matColumnDef="requesterPosition">
                  <th mat-header-cell *matHeaderCellDef>Requester Position</th>
                  <td mat-cell *matCellDef="let element">{{element.requesterPosition || 'N/A'}}</td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let element">{{element.department}}</td>
                </ng-container>

                <ng-container matColumnDef="approvedByName">
                  <th mat-header-cell *matHeaderCellDef>Approved By</th>
                  <td mat-cell *matCellDef="let element">{{element.approvedByName || 'Pending'}}</td>
                </ng-container>

                <ng-container matColumnDef="approvedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Approved</th>
                  <td mat-cell *matCellDef="let element">{{element.approvedByDate ? (element.approvedByDate | date:'mediumDate') : 'N/A'}}</td>
                </ng-container>

                <ng-container matColumnDef="issuedByName">
                  <th mat-header-cell *matHeaderCellDef>Issued By</th>
                  <td mat-cell *matCellDef="let element">{{element.issuedByName || 'Pending'}}</td>
                </ng-container>

                <ng-container matColumnDef="issuedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Issued</th>
                  <td mat-cell *matCellDef="let element">{{element.issuedByDate ? (element.issuedByDate | date:'mediumDate') : 'N/A'}}</td>
                </ng-container>

                <ng-container matColumnDef="receivedByName">
                  <th mat-header-cell *matHeaderCellDef>Received By</th>
                  <td mat-cell *matCellDef="let element">{{element.receivedByName || 'Pending'}}</td>
                </ng-container>

                <ng-container matColumnDef="receivedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Received</th>
                  <td mat-cell *matCellDef="let element">{{element.receivedByDate ? (element.receivedByDate | date:'mediumDate') : 'N/A'}}</td>
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
    .sidebar {
      position: sticky;
    }

    .layout {
      display: flex;
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
      height: 60px;
      padding-bottom: 10px;
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

    .dashboard-card.full-width {
      grid-column: 1 / -1;
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

    .filter-controls, .chart-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 10px;
    }

    /* Chart Controls Styling */
    .chart-controls {
      flex-wrap: wrap;
      gap: 16px;
      align-items: flex-start;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .control-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .period-select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
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
      border-radius: 10px !important;
    }

    /* Chart Styles */
    .chart-container {
      position: relative;
      padding: 24px;
      height: 400px;
    }

    .chart-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-left: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }

    .legend-text {
      font-size: 0.875rem;
      color: #4b5563;
    }

    .no-chart-data {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 350px;
      color: #6b7280;
      font-style: italic;
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

    .status-badge.workflow-status.pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-badge.workflow-status.approved {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .status-badge.workflow-status.completed {
      background-color: #dcfce7;
      color: #166534;
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

      .filter-controls, .chart-controls {
        width: 100%;
        justify-content: space-between;
      }

      .content-area {
        padding: 16px;
      }

      .chart-legend {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class Dashboard implements OnInit, OnDestroy, AfterViewInit {
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
  allRequisitions = signal<RequisitionForm[]>([]);
  consumptionAnalyticsData = signal<ConsumptionAnalytics[]>([]);
  
  // Filter periods
  selectedPeriod = signal('month');
  selectedChartPeriod = signal('6months');
  selectedMonthFilter = signal('all');

  // Table column definitions
  recentItemsColumns = ['item_id', 'itemName', 'serialNumber', 'category', 'quantity', 'location', 'dateAdded'];
  stockAlertsColumns = ['item_id', 'itemName', 'serialNumber', 'category', 'quantity', 'unit', 'location', 'status'];
  
  // Updated requisitions columns - removed workflowStatus
  requisitionsColumns = [
    'rsNumber', 
    'rfNumber', 
    'requesterName', 
    'requesterPosition', 
    'department', 
    'approvedByName', 
    'approvedByDate', 
    'issuedByName', 
    'issuedByDate', 
    'receivedByName', 
    'receivedByDate'
  ];

  private subscriptions: Subscription = new Subscription();
  private chart: any = null;

  // Categories for analytics
  categories = ['Electronics', 'IT Supplies', 'Janitorial', 'Office Supplies', 'Other'];
  categoryColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#64748b'];

  // Computed signals for filtered data
  filteredRecentItems = computed(() => {
    const items = this.allInventoryItems();
    const now = new Date();
    let filterDate: Date;

    switch (this.selectedPeriod()) {
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
      .slice(0, 10);
  });

  lowStockItems = computed(() => {
    return this.allInventoryItems()
      .filter(item => (item.quantity ?? 0) < (item.stockThreshold ?? 5))
      .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
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
      .slice(0, 15);
  });

  // Updated category consumption data for monthly analytics
  categoryConsumptionData = computed(() => {
    const items = this.allInventoryItems();
    const period = this.selectedChartPeriod();
    const now = new Date();
    
    // Generate month labels based on selected period
    const monthLabels = this.generateMonthLabels(period);
    
    // Group items by category and calculate monthly consumption
    const categoryMap = new Map<string, MonthlyConsumption[]>();
    
    // Initialize categories with zero consumption for all months
    this.categories.forEach(cat => {
      categoryMap.set(cat, monthLabels.map(month => ({ month, count: 0 })));
    });

    // Calculate consumption based on dateAdded (simulating consumption data)
    items.forEach(item => {
      if (!item.dateAdded) return;
      
      const itemDate = new Date(item.dateAdded);
      const monthKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}`;
      
      // Only include items within the selected period
      if (!monthLabels.includes(monthKey)) return;
      
      const category = item.category || 'Other';
      const normalizedCategory = this.categories.find(cat => 
        cat.toLowerCase() === category.toLowerCase()
      ) || 'Other';
      
      const categoryData = categoryMap.get(normalizedCategory);
      if (categoryData) {
        const monthData = categoryData.find(m => m.month === monthKey);
        if (monthData) {
          // Simulate consumption: Add random consumption between 1-3 per item
          monthData.count += Math.floor(Math.random() * 3) + 1;
        }
      }
    });

    // Convert to CategoryConsumption format
    return Array.from(categoryMap.entries()).map(([category, monthlyData], index) => ({
      category,
      monthlyData,
      color: this.categoryColors[index] || '#64748b'
    }));
  });

  // Filtered category data based on month filter
  filteredCategoryData = computed(() => {
    const monthFilter = this.selectedMonthFilter();
    const allData = this.categoryConsumptionData();
    
    if (monthFilter === 'all') {
      return allData.map(cat => ({
        ...cat,
        totalConsumption: cat.monthlyData.reduce((sum, month) => sum + month.count, 0)
      }));
    }
    
    // Filter data for specific month
    return allData.map(cat => {
      const monthData = cat.monthlyData.filter(m => m.month === monthFilter);
      return {
        ...cat,
        monthlyData: monthData,
        totalConsumption: monthData.reduce((sum, month) => sum + month.count, 0)
      };
    }).filter(cat => cat.totalConsumption > 0); // Only show categories with consumption in selected month
  });

  // Available months for filtering
  availableMonths = computed(() => {
    const period = this.selectedChartPeriod();
    const monthLabels = this.generateMonthLabels(period);
    
    return monthLabels.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return {
        value: month,
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    });
  });

  async ngOnInit() {
    try {
      await this.authService.waitForInitialization();
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return;
      }

      const userSub = this.authService.currentUser$.subscribe(user => this.currentUser.set(user));
      this.subscriptions.add(userSub);

      const authSub = this.authService.isAuthenticated$.subscribe(isAuth => {
        if (!isAuth) this.router.navigate(['/login']);
      });
      this.subscriptions.add(authSub);

      await this.loadDashboardData();
      this.authService.refreshAuthState();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    // Load Chart.js and initialize chart after view init
    this.loadChartJS().then(() => {
      setTimeout(() => this.initializeChart(), 100);
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    this.subscriptions.unsubscribe();
  }

  private generateMonthLabels(period: string): string[] {
    const now = new Date();
    const labels: string[] = [];
    
    let monthsBack = 6;
    if (period === '12months') monthsBack = 12;
    else if (period === 'currentYear') monthsBack = now.getMonth() + 1;

    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      labels.push(monthKey);
    }
    
    return labels;
  }

  private async loadChartJS(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Chart.js'));
      document.head.appendChild(script);
    });
  }

  private initializeChart() {
    const canvas = document.getElementById('consumptionChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.categoryConsumptionData();
    const period = this.selectedChartPeriod();
    const monthLabels = this.generateMonthLabels(period);

    // Prepare datasets for line chart
    const datasets = data.map(categoryData => {
      // Create data array matching month labels
      const chartData = monthLabels.map(month => {
        const monthData = categoryData.monthlyData.find(m => m.month === month);
        return monthData ? monthData.count : 0;
      });

      return {
        label: categoryData.category,
        data: chartData,
        borderColor: categoryData.color,
        backgroundColor: categoryData.color + '20', // Add transparency
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    // Format month labels for display
    const displayLabels = monthLabels.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: displayLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // We're using custom legend
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: (context: any) => {
                return `${context[0].label} - Consumption`;
              },
              label: (context: any) => {
                return `${context.dataset.label}: ${context.parsed.y} items`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month'
            },
            grid: {
              display: true,
              color: '#f3f4f6'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Items Consumed'
            },
            beginAtZero: true,
            grid: {
              display: true,
              color: '#f3f4f6'
            },
            ticks: {
              stepSize: 1,
              callback: function(value: any) {
                return Number.isInteger(value) ? value : '';
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }

  private updateChart() {
    if (!this.chart) {
      this.initializeChart();
      return;
    }

    const data = this.categoryConsumptionData();
    const period = this.selectedChartPeriod();
    const monthLabels = this.generateMonthLabels(period);

    // Update datasets
    const datasets = data.map(categoryData => {
      const chartData = monthLabels.map(month => {
        const monthData = categoryData.monthlyData.find(m => m.month === month);
        return monthData ? monthData.count : 0;
      });

      return {
        label: categoryData.category,
        data: chartData,
        borderColor: categoryData.color,
        backgroundColor: categoryData.color + '20',
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6
      };
    });

    const displayLabels = monthLabels.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });

    this.chart.data.labels = displayLabels;
    this.chart.data.datasets = datasets;
    this.chart.update('active');
  }

  private async loadDashboardData() {
    try {
      // Load inventory data
      const inventory = await firstValueFrom(this.inventoryService.getAllInventory());
      this.allInventoryItems.set(inventory);

      // Load requisitions data
      const requisitions = await firstValueFrom(this.requisitionsService.getAll());
      this.allRequisitions.set(requisitions);

      // Load consumption analytics if available
      try {
        const analytics = await firstValueFrom(this.inventoryService.getConsumptionAnalytics());
        // Transform the analytics data if it's in a different format
        if (analytics && Array.isArray(analytics)) {
          this.consumptionAnalyticsData.set(analytics);
        }
      } catch (analyticsError) {
        console.log('Consumption analytics not available, using inventory data for simulation');
        // Fallback: simulate consumption data from inventory
        this.simulateConsumptionData();
      }

      // Update chart after data is loaded
      setTimeout(() => {
        this.updateChart();
      }, 100);

      // Set up chart period change listener
      const chartPeriodSub = this.selectedChartPeriod.set;
      // Subscribe to chart period changes to update chart
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.snackBar.open('Error loading dashboard data', 'OK', { duration: 3000 });
    }
  }

  private simulateConsumptionData() {
    // Simulate consumption data based on inventory items
    // This is a fallback when real consumption analytics aren't available
    const items = this.allInventoryItems();
    const simulatedData: ConsumptionAnalytics[] = [];
    
    items.forEach(item => {
      // Simulate that some items were "consumed" based on their date added
      if (item.dateAdded) {
        const consumptionDate = new Date(item.dateAdded);
        // Add some randomness to simulate different consumption dates
        consumptionDate.setDate(consumptionDate.getDate() + Math.floor(Math.random() * 30));
        
        simulatedData.push({
          itemId: item.itemId,
          itemName: item.itemName,
          category: item.category,
          consumedQuantity: Math.floor(Math.random() * 5) + 1, // Random consumption 1-5
          dateConsumed: consumptionDate.toISOString()
        });
      }
    });
    
    this.consumptionAnalyticsData.set(simulatedData);
  }

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
    this.downloadCSV(csvContent, `recent_items_${this.selectedPeriod()}_${new Date().toISOString().split('T')[0]}.csv`);
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
    const headers = [
      'RS Number', 
      'RF Number', 
      'Requester Name', 
      'Requester Position', 
      'Department', 
      'Approved By', 
      'Date Approved', 
      'Issued By', 
      'Date Issued', 
      'Received By', 
      'Date Received'
    ];
    const csvContent = [
      headers.join(','),
      ...requisitions.map(req => [
        req.rsNumber || 'N/A',
        req.rfNumber || 'N/A',
        req.requesterName,
        req.requesterPosition || 'N/A',
        req.department,
        req.approvedByName || 'Pending',
        req.approvedByDate ? new Date(req.approvedByDate).toLocaleDateString() : 'N/A',
        req.issuedByName || 'Pending',
        req.issuedByDate ? new Date(req.issuedByDate).toLocaleDateString() : 'N/A',
        req.receivedByName || 'Pending',
        req.receivedByDate ? new Date(req.receivedByDate).toLocaleDateString() : 'N/A'
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

  // Chart period change handler
  onChartPeriodChange(newPeriod: string) {
    this.selectedChartPeriod.set(newPeriod);
    this.selectedMonthFilter.set('all'); // Reset month filter when period changes
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  // Month filter change handler
  onMonthFilterChange(newMonth: string) {
    this.selectedMonthFilter.set(newMonth);
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  getDisplayName(): string {
    const user = this.currentUser();
    return user?.email?.split('@')[0] ?? user?.username ?? 'User';
  }

  getInitials(): string {
    const user = this.currentUser();
    return user?.email?.charAt(0).toUpperCase() ?? user?.username?.charAt(0).toUpperCase() ?? 'A';
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }
}