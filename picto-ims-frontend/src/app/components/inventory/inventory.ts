import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
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
import { Subscription,firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import { PictoInventory, InventoryService, CreatePictoInventoryRequest, UpdatePictoInventoryRequest } from '../../services/inventory.service';

import { InventoryAddDialogComponent } from './inventory.add';
import { InventoryEditDialogComponent } from './inventory.edit';
import { InventoryDeleteDialogComponent } from './inventory.delete';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    FormsModule,
    SidebarComponent
  ],
  template: `
  <div class="layout">
    <app-sidebar [class.collapsed]="isCollapsed" (toggle)="isCollapsed = !isCollapsed"></app-sidebar>

    <div class="content">
      <header class="top-header">
        <div class="header-left">
          <h2>Inventory</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="header-img">
        </div>
      </header>

      <div class="content-area">
        <div class="table-section">
          <!-- Table Controls -->
          <div class="table-controls">
            <div class="controls-left">
              <button mat-stroked-button class="export-btn" (click)="exportCSV()">Export CSV</button>
              <ng-container *ngIf="userRole !== 'User'">
                <button mat-stroked-button class="add-btn" (click)="openAddDialog()">Add</button>
                <button mat-stroked-button class="edit-btn"
                        [disabled]="!getSelectedItem()"
                        (click)="openEditDialog(getSelectedItem()!)">Edit</button>
                <button mat-stroked-button class="delete-btn"
                        [disabled]="getSelectedCount() === 0"
                        (click)="openDeleteDialog(getSelectedItems())"
                        color="warn">
                  {{ getSelectedCount() === dataSource().length ? 'Delete All' : 'Delete' }}
                </button>
              </ng-container>
            </div>

            <div class="controls-right">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search...</mat-label>
                <input matInput (input)="onSearch($event)" placeholder="Item name or Serial No.">
              </mat-form-field>
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource()" class="data-table">

              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox [checked]="isAllSelected()"
                                [indeterminate]="isIndeterminate()"
                                (change)="toggleAllSelection()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox [(ngModel)]="row.selected"></mat-checkbox>
                </td>
              </ng-container>

              <ng-container matColumnDef="itemName">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let element">{{element.itemName}}</td>
              </ng-container>

              <ng-container matColumnDef="serialNumber">
                <th mat-header-cell *matHeaderCellDef>Serial Number</th>
                <td mat-cell *matCellDef="let element">{{element.serialNumber}}</td>
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
                <td mat-cell *matCellDef="let element" [class.low-stock]="element.quantity <= element.stockThreshold">
                  {{element.quantity}}
                  <mat-icon *ngIf="element.quantity <= element.stockThreshold" class="warning-icon"
                            matTooltip="Quantity is at or below stock threshold ({{element.stockThreshold}})">
                    !
                  </mat-icon>
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

              <ng-container matColumnDef="dateAdded">
                <th mat-header-cell *matHeaderCellDef>Date Added</th>
                <td mat-cell *matCellDef="let element">{{element.dateAdded | date:'mediumDate'}}</td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" [class.selected-row]="row.selected"></tr>

            </table>
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

    .content { flex:1; padding:10px; width:100%; }

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
    .content-area { padding:24px; flex:1; }
    .table-section { background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
    .table-controls { display:flex; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f3f4f6; align-items: center; }
    .controls-left { display:flex; gap:8px; }
    .controls-left button {
      border-radius: 10px;
      height: 47px;
    }

    .export-btn:hover {
      background-color: #28a745 !important;
      color: white !important;
    }

    .add-btn:hover {
      background-color: #253c90 !important;
      color: white !important;
    }

    .edit-btn:hover {
      background-color: #ffc005ff !important;
      color: black !important;
    }

    .delete-btn:hover {
      background-color: #dc3545 !important;
      color: white !important;
    }
    .table-container { overflow-x:auto;}
    .data-table { width:100%; border-spacing:0; font-size:0.875rem;}
    .data-table th { background:#f9fafb; padding:16px 12px; font-weight:600; border-bottom:2px solid #e5e7eb; text-align:left;}
    .data-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .selected-row { background-color:#eff6ff !important; }
    .data-table tr:hover { background-color:#f9fafb; }
    .header-img {
      width: auto;
      height: 60px;
      padding-bottom: 10px;
    }

    .search-container {
      display: flex;
      align-items: center;
      border: 1px solid #000000;
      border-radius: 10px;
      padding-top: 0;
      padding: 5px;
    }

    .search-input {
      border: none;
      outline: none;
      flex-grow: 1;
      padding: 8px 15px;
      font-size: 16px;
      font-family: Montserrat;
    }

    .search-input:focus {
      outline: none;
    }
    
    .search-field {
      width: 100%;
    }

    .search-icon-container {
      padding: 0 10px;
    }

    .search-icon {
      width: 20px;
      height: 20px;
      fill: #000000ff;
    }

    .warning-icon {
      color: #f59e0b;
      font-size: 16px;
      margin-left: 8px;
    }

    .low-stock {
      color: #dc2626;
      font-weight: 600;
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
  `]
})

export class Inventory implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  userRole: 'User' | 'Manager' | 'Admin' | '' = '';
  currentUser: User | null = null;
  isCollapsed = false;
  dataSource = signal<PictoInventory[]>([]);
  originalDataSource: PictoInventory[] = [];
  displayedColumns = [
    'select',
    'serialNumber',
    'itemName',
    'description',
    'category',
    'quantity',
    'unit',
    'location',
    'status',
    'dateAdded'
  ];
  private subscriptions = new Subscription();

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  async ngOnInit() {
    try {
      // Get current user info
      this.currentUser = this.authService.getCurrentUser();
      this.userRole = (this.currentUser?.role as 'User' | 'Manager' | 'Admin') || '';
      
      // Fetch inventory
      const inventory = await firstValueFrom(this.inventoryService.getAllInventory());
      this.dataSource.set([...inventory]);
      this.originalDataSource = [...inventory];

      console.log('Current user:', this.currentUser);
    } catch (error) {
      console.error('Error loading inventory:', error);
      this.snack.open('Error loading inventory', 'OK', { duration: 3000 });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Role helpers
  isUser(): boolean {
    return this.userRole === 'User';
  }
  isManager(): boolean {
    return this.userRole === 'Manager';
  }
  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  /** --- Search --- */
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = target.value.toLowerCase();
    if (!val) { 
      this.dataSource.set([...this.originalDataSource]); 
      return; 
    }
    this.dataSource.set(this.originalDataSource.filter(i => 
      i.itemName.toLowerCase().includes(val) || 
      (i.serialNumber && i.serialNumber.toLowerCase().includes(val))
    ));
  }

  /** --- Add Dialog --- */
  openAddDialog() {
    const dialogRef = this.dialog.open(InventoryAddDialogComponent, {
      width: '500px',
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addNewItem(result);
      }
    });
  }

  private addNewItem(itemData: any) {
    if (!itemData.itemName?.trim()) {
      this.snack.open('Item name is required', 'OK', { duration: 3000 });
      return;
    }

    if (!itemData.quantity || itemData.quantity < 0) {
      this.snack.open('Quantity must be 0 or greater', 'OK', { duration: 3000 });
      return;
    }

    const newItemRequest: CreatePictoInventoryRequest = {
      itemName: itemData.itemName,
      serialNumber: itemData.serialNumber || '',
      description: itemData.description || '',
      category: itemData.category || '',
      quantity: itemData.quantity || 0,
      unit: itemData.unit || '',
      location: itemData.location || '',
      status: itemData.status || 'Available',
      stockThreshold: itemData.stockThreshold || 10
    };

    this.inventoryService.createInventory(newItemRequest).subscribe({
      next: (createdItem) => {
        this.dataSource.set([createdItem, ...this.dataSource()]);
        this.originalDataSource.push(createdItem);
        this.snack.open('Item added successfully', 'OK', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error adding inventory item:', err);
        this.snack.open(err.message || 'Failed to add item', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Edit Dialog --- */
  openEditDialog(item: PictoInventory) {
    const dialogRef = this.dialog.open(InventoryEditDialogComponent, {
      width: '500px',
      disableClose: true,
      data: { item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateItem(item.itemId, result);
      }
    });
  }

  private updateItem(itemId: number, updatedData: any) {
    if (!updatedData?.itemName?.trim()) {
      this.snack.open('Item name is required', 'OK', { duration: 3000 });
      return;
    }

    const updateRequest: UpdatePictoInventoryRequest = {
      itemId: itemId,
      itemName: updatedData.itemName,       
      serialNumber: updatedData.serialNumber || '',
      description: updatedData.description || '',
      category: updatedData.category || '',
      quantity: updatedData.quantity || 0,
      unit: updatedData.unit || '',
      location: updatedData.location || '',
      status: updatedData.status || 'Available',
      stockThreshold: updatedData.stockThreshold || 10
    };

    this.inventoryService.updateInventory(itemId, updateRequest).subscribe({
      next: (updatedItem) => {
        this.dataSource.set(
          this.dataSource().map(i => i.itemId === itemId ? { ...i, ...updatedItem } : i)
        );

        this.originalDataSource = this.originalDataSource.map(i =>
          i.itemId === itemId ? { ...i, ...updatedItem } : i
        );

        this.snack.open('Item updated successfully', 'OK', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error updating inventory item:', err);
        this.snack.open(err.message || 'Failed to update item', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Delete Dialog --- */
  openDeleteDialog(items: PictoInventory[] | null) {
    if (!items || !items.length) return;

    const isBulk = items.length > 1;

    const dialogRef = this.dialog.open(InventoryDeleteDialogComponent, {
      width: '400px',
      data: { items, isBulk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isBulk) {
          this.deleteSelected();
        } else {
          this.deleteItem(items[0].itemId);
        }
      }
    });
  }

  private deleteItem(itemId: number) {
    if (!itemId) {
      this.snack.open('Invalid item ID', 'OK', { duration: 3000 });
      return;
    }

    // Get current user info for tracking
    const currentUsername = this.currentUser?.username || 'Unknown User';
    const reason = `Deleted by ${currentUsername}`;
    
    console.log('Deleting item with user:', currentUsername);

    this.inventoryService.softDeleteInventory(itemId, reason, currentUsername).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(i => i.itemId !== itemId));
        this.originalDataSource = this.originalDataSource.filter(i => i.itemId !== itemId);
        this.snack.open('Item archived successfully', 'OK', { duration: 2000 });
      },
      error: err => {
        console.error('Error archiving inventory item:', err);
        this.snack.open(err.message || 'Failed to archive item. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }

  private deleteSelected() {
    const selected = this.dataSource().filter(i => i.selected);
    if (!selected.length) {
      this.snack.open('No items selected for deletion', 'OK', { duration: 3000 });
      return;
    }

    const ids = selected.map(i => i.itemId);
    
    // Get current user info for tracking
    const currentUsername = this.currentUser?.username || 'Unknown User';
    const reason = `Bulk deletion by ${currentUsername}`;
    
    console.log('Bulk deleting items with user:', currentUsername);

    this.inventoryService.softDeleteInventoryBulk(ids, reason, currentUsername).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(i => !i.selected));
        this.originalDataSource = this.originalDataSource.filter(i => !ids.includes(i.itemId));
        this.snack.open(`${ids.length} item(s) archived successfully`, 'OK', { duration: 2000 });
      },
      error: err => {
        console.error('Error archiving selected items:', err);
        this.snack.open(err.message || 'Failed to archive selected items. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Selection Methods --- */
  isAllSelected(): boolean { 
    return this.dataSource().length > 0 && this.dataSource().every(r => r.selected); 
  }
  
  isIndeterminate(): boolean { 
    const selectedCount = this.dataSource().filter(r => r.selected).length; 
    return selectedCount > 0 && selectedCount < this.dataSource().length; 
  }
  
  toggleAllSelection(): void { 
    const allSelected = this.isAllSelected(); 
    this.dataSource().forEach(r => r.selected = !allSelected); 
  }
  
  getSelectedCount(): number { 
    return this.dataSource().filter(r => r.selected).length; 
  }
  
  getSelectedItem(): PictoInventory | null { 
    return this.dataSource().find(r => r.selected) || null; 
  }

  getSelectedItems(): PictoInventory[] {
    return this.dataSource().filter(r => r.selected);
  }

  /** --- Export CSV --- */
  exportCSV() {
    const rows = this.dataSource(); 
    if (!rows.length) { 
      this.snack.open('No data to export', 'OK', { duration: 2000 }); 
      return; 
    }
    
    const headers = ['ID','Serial Number','Name','Description','Category','Quantity','Unit','Location','Status','Date Added','Stock Threshold'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        r.itemId,
        r.serialNumber || '',
        r.itemName,
        r.description || '',
        r.category || '',
        r.quantity,
        r.unit || '',
        r.location || '',
        r.status,
        r.dateAdded,
        r.stockThreshold
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.snack.open('CSV exported successfully', 'OK', { duration: 2000 });
  }
}