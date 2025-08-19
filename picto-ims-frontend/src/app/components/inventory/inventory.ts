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
import { PictoInventory, InventoryService } from '../../services/inventory.service';

import { InventoryAddDialogComponent } from './inventory.add';
import { InventoryEditDialogComponent } from './inventory.edit';
import { InventoryDeleteDialogComponent } from './inventory.delete';

@Component({
  selector: 'app-inventory',
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
          <h2>Inventory</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="headerr-img">
        </div>
      </header>

      <div class="content-area">
        <div class="table-section">
          <div class="table-controls">
            <div class="controls-left">
              <button mat-stroked-button class="export-btn" (click)="exportCSV()">
                Export
              </button>
              <button mat-stroked-button class="add-btn" (click)="openAddDialog()">
                Add
              </button>
              <button mat-stroked-button class="add-btn" 
                      [disabled]="!getSelectedItem()" 
                      (click)="openEditDialog(getSelectedItem()!)">
                Edit
              </button>
              <button mat-stroked-button class="add-btn"
                      [disabled]="!getSelectedItem()"
                      (click)="openDeleteDialog(getSelectedItem()!)">
                Delete
              </button>
            </div>
            <div class="controls-right">
              <mat-form-field appearance="outline" class="search-field">
                <input matInput placeholder="Search.." (input)="onSearch($event)">
              </mat-form-field>
            </div>

            <div class="table-container">
  <table mat-table [dataSource]="dataSource()" class="data-table">

  <!-- Select Column -->
  <ng-container matColumnDef="select">
    <th mat-header-cell *matHeaderCellDef>
      <mat-checkbox
        [checked]="isAllSelected()"
        [indeterminate]="isIndeterminate()"
        (change)="toggleAllSelection()">
      </mat-checkbox>
    </th>
    <td mat-cell *matCellDef="let row">
      <mat-checkbox [(ngModel)]="row.selected"></mat-checkbox>
    </td>
  </ng-container>

  <ng-container matColumnDef="item_id">
    <th mat-header-cell *matHeaderCellDef>ID</th>
    <td mat-cell *matCellDef="let element">{{element.item_id}}</td>
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

export class Inventory implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  isCollapsed = false;
  dataSource = signal<PictoInventory[]>([]);
  originalDataSource: PictoInventory[] = [];
  displayedColumns = ['select','serialNumber','itemName','description','category','quantity','unit','location','status','dateAdded'];
  private subscriptions = new Subscription();

  toggleSidebar() { this.isCollapsed = !this.isCollapsed; }

  async ngOnInit() {
    try {
      const inventory = await firstValueFrom(this.inventoryService.getAllInventory());
      this.dataSource.set([...inventory]);
      this.originalDataSource = [...inventory];
    } catch (error) {
      console.error('Error loading inventory:', error);
      this.snack.open('Error loading inventory', 'OK', { duration: 3000 });
    }
  }

  ngOnDestroy() { 
    this.subscriptions.unsubscribe(); 
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
    const newItem: PictoInventory = {
      itemId: Math.max(0, ...this.dataSource().map(i => i.itemId)) + 1,
      itemName: itemData.name,
      serialNumber: itemData.serial_no || '',
      description: itemData.description || '',
      category: itemData.category || '',
      quantity: itemData.quantity || 0,
      unit: itemData.unit || '',
      location: itemData.location || '',
      status: itemData.status || 'Available',
      dateAdded: new Date().toISOString(),
      selected: false
    };
    
    this.dataSource.set([newItem, ...this.dataSource()]);
    this.originalDataSource.push(newItem);
    this.snack.open('Item added successfully', 'OK', { duration: 2000 });
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
    const updatedItem: PictoInventory = {
      ...updatedData,
      itemId: itemId,
      dateAdded: this.dataSource().find(i => i.itemId === itemId)?.dateAdded || new Date().toISOString()
    };
    
    this.dataSource.set(this.dataSource().map(i => i.itemId === itemId ? updatedItem : i));
    this.originalDataSource = this.originalDataSource.map(i => i.itemId === itemId ? updatedItem : i);
    this.snack.open('Item updated successfully', 'OK', { duration: 2000 });
  }

  /** --- Delete Dialog --- */
  openDeleteDialog(item: PictoInventory) {
    const dialogRef = this.dialog.open(InventoryDeleteDialogComponent, {
      width: '400px',
      data: { 
        item: {
          id: item.itemId,
          name: item.itemName,
          serial_no: item.serialNumber
        }
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteItem(item.itemId);
      }
    });
  }

  private deleteItem(itemId: number) {
    this.dataSource.set(this.dataSource().filter(i => i.itemId !== itemId));
    this.originalDataSource = this.originalDataSource.filter(i => i.itemId !== itemId);
    this.snack.open('Item deleted successfully', 'OK', { duration: 2000 });
  }

  /** --- Bulk Delete --- */
  deleteSelected() {
    const selected = this.dataSource().filter(i => i.selected);
    if (selected.length === 0) {
      this.snack.open('No items selected', 'OK', { duration: 2000 });
      return;
    }
    
    if (!confirm(`Delete ${selected.length} selected item(s)?`)) return;
    
    this.dataSource.set(this.dataSource().filter(i => !i.selected));
    this.originalDataSource = this.originalDataSource.filter(i => !selected.some(s => s.itemId === i.itemId));
    this.snack.open('Selected items deleted', 'OK', { duration: 2000 });
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

  /** --- Export CSV --- */
  exportCSV() {
    const rows = this.dataSource(); 
    if (!rows.length) { 
      this.snack.open('No data to export', 'OK', { duration: 2000 }); 
      return; 
    }
    
    const headers = ['ID','Serial Number','Name','Description','Category','Quantity','Unit','Location','Status','Date Added'];
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
        r.dateAdded
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