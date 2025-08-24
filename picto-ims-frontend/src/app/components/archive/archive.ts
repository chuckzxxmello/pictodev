import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';

import { PictoInventory, InventoryService, InventoryArchive } from '../../services/inventory.service';
import { RequisitionArchive, RequisitionsService } from '../../services/requisitions.service';
import { ArchiveInventoryDeleteDialogComponent } from './archive.inventory.delete';
import { ArchiveRequisitionDeleteDialogComponent } from './archive.requisition.delete';

type ArchiveItem = (InventoryArchive | RequisitionArchive) & { selected?: boolean };

@Component({
  selector: 'app-archive',
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
          <h2>Archive</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="header-img">
        </div>
      </header>

      <div class="content-area">
        <div class="table-section">

          <div class="table-controls">
            <div class="controls-left">
              <mat-slide-toggle [checked]="archiveType === 'requisition'"
                                (change)="switchArchiveType($event.checked ? 'requisition' : 'inventory')">
                Viewing: {{ archiveType === 'inventory' ? 'Inventory' : 'Requisitions' }}
              </mat-slide-toggle>
              <button mat-stroked-button class="export-btn" (click)="exportCSV()">Export</button>
              <button mat-stroked-button
                      [disabled]="getSelectedCount() === 0"
                      (click)="openDeleteDialog(getSelectedItems())"
                      color="warn">
                {{ getSelectedCount() === dataSource().length ? 'Delete All Permanently' : 'Delete Permanently' }}
              </button>
            </div>
            <div class="controls-right">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search...</mat-label>
                <input matInput (input)="onSearch($event)" placeholder="Serial No., RS Id., Name...">
              </mat-form-field>
            </div>
          </div>

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

              <ng-container *ngIf="archiveType === 'inventory'">
                <ng-container matColumnDef="archiveId">
                  <th mat-header-cell *matHeaderCellDef>Archive ID</th>
                  <td mat-cell *matCellDef="let element">{{element.archiveId}}</td>
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

                <ng-container matColumnDef="archivedAt">
                  <th mat-header-cell *matHeaderCellDef>Archived Date</th>
                  <td mat-cell *matCellDef="let element">{{element.archivedAt | date:'mediumDate'}}</td>
                </ng-container>

                <ng-container matColumnDef="archivedReason">
                  <th mat-header-cell *matHeaderCellDef>Deleted By</th>
                  <td mat-cell *matCellDef="let element">{{element.archivedReason || 'N/A'}}</td>
                </ng-container>

                <ng-container matColumnDef="archivedBy">
                  <th mat-header-cell *matHeaderCellDef>Archived By</th>
                  <td mat-cell *matCellDef="let element">{{element.archivedBy || 'System'}}</td>
                </ng-container>
              </ng-container>

              <ng-container *ngIf="archiveType === 'requisition'">
                <ng-container matColumnDef="rfId">
                    <th mat-header-cell *matHeaderCellDef>RF ID</th>
                    <td mat-cell *matCellDef="let element">{{element.rfId}}</td>
                </ng-container>
                <ng-container matColumnDef="rsNumber">
                    <th mat-header-cell *matHeaderCellDef>RS Number</th>
                    <td mat-cell *matCellDef="let element">{{element.rsNumber}}</td>
                </ng-container>
                <ng-container matColumnDef="rfNumber">
                    <th mat-header-cell *matHeaderCellDef>RF Number</th>
                    <td mat-cell *matCellDef="let element">{{element.rfNumber}}</td>
                </ng-container>
                <ng-container matColumnDef="requesterName">
                    <th mat-header-cell *matHeaderCellDef>Requester</th>
                    <td mat-cell *matCellDef="let element">{{element.requesterName}}</td>
                </ng-container>
                <ng-container matColumnDef="department">
                    <th mat-header-cell *matHeaderCellDef>Department</th>
                    <td mat-cell *matCellDef="let element">{{element.department}}</td>
                </ng-container>
                <ng-container matColumnDef="purpose">
                    <th mat-header-cell *matHeaderCellDef>Purpose</th>
                    <td mat-cell *matCellDef="let element">{{element.purpose}}</td>
                </ng-container>
                <ng-container matColumnDef="archivedAt">
                    <th mat-header-cell *matHeaderCellDef>Date Archived</th>
                    <td mat-cell *matCellDef="let element">{{element.archivedAt | date:'mediumDate'}}</td>
                </ng-container>
                <ng-container matColumnDef="archivedBy">
                    <th mat-header-cell *matHeaderCellDef>Archived By</th>
                    <td mat-cell *matCellDef="let element">{{element.archivedBy || 'System'}}</td>
                </ng-container>
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
    .controls-left { display:flex; gap:8px; align-items: center; }

    .controls-left button {
      border-radius: 10px;
      height: 47px;
    }

    /* Hover effect for the Export button */
    .export-btn:hover {
      background-color: #28a745 !important; /* Green */
      color: white !important;
    }

    .table-container { overflow-x:auto; }
    .data-table { width:100%; border-spacing:0; font-size:0.875rem; }
    .data-table th { background:#f9fafb; padding:16px 12px; font-weight:600; border-bottom:2px solid #e5e7eb; text-align:left; }
    .data-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .selected-row { background-color:#eff6ff !important; }
    .data-table tr:hover { background-color:#f9fafb; }
    .header-img {
      width: auto;
      height: 60px;
      padding-bottom: 10px;
    }

    .search-field {
      width: 300px;
    }
  `]
})
export class Archive implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private requisitionsService = inject(RequisitionsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  isCollapsed = false;
  archiveType: 'inventory' | 'requisition' = 'inventory';
  dataSource = signal<ArchiveItem[]>([]);
  originalDataSource: ArchiveItem[] = [];
  displayedColumns: string[] = [];
  subscriptions = new Subscription();
  
  async ngOnInit() {
    await this.loadArchive();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async loadArchive() {
    try {
      if (this.archiveType === 'inventory') {
        const inventory = await firstValueFrom(this.inventoryService.getAllArchived());
        console.log('Loaded inventory archive:', inventory);
        const inventoryWithSelection = inventory.map(item => ({ ...item, selected: false }));
        this.dataSource.set(inventoryWithSelection);
        this.originalDataSource = inventoryWithSelection;
        this.displayedColumns = ['select', 'archiveId', 'itemName', 'serialNumber', 'category', 'quantity', 'archivedAt', 'archivedReason', 'archivedBy'];
      } else {
        const requisitions = await firstValueFrom(this.requisitionsService.getAllArchived());
        console.log('Loaded requisition archive:', requisitions);
        const requisitionsWithSelection = requisitions.map(item => ({ ...item, selected: false }));
        this.dataSource.set(requisitionsWithSelection);
        this.originalDataSource = requisitionsWithSelection;
        this.displayedColumns = ['select', 'rfId', 'rsNumber', 'rfNumber', 'requesterName', 'department', 'purpose', 'archivedAt', 'archivedBy'];
      }
    } catch (error) {
      console.error('Error loading archive:', error);
      this.snack.open('Error loading archive', 'OK', { duration: 3000 });
    }
  }
  
  onSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    if (!val) {
      this.dataSource.set([...this.originalDataSource]);
      return;
    }
    const filtered = this.originalDataSource.filter(i => {
      if (this.isInventoryItem(i)) {
        return i.itemName.toLowerCase().includes(val) || 
               (i.serialNumber?.toLowerCase().includes(val) ?? false) ||
               (i.archivedBy?.toLowerCase().includes(val) ?? false) ||
               (i.archivedReason?.toLowerCase().includes(val) ?? false);
      }
      if (this.isRequisitionItem(i)) {
        return i.rfId.toLowerCase().includes(val) || 
               (i.rsNumber?.toLowerCase().includes(val) ?? false) ||
               (i.rfNumber?.toLowerCase().includes(val) ?? false) ||
               (i.requesterName?.toLowerCase().includes(val) ?? false) ||
               (i.archivedBy?.toLowerCase().includes(val) ?? false);
      }
      return false;
    });
    this.dataSource.set(filtered);
  }

  isAllSelected = () => this.dataSource().length > 0 && this.dataSource().every(r => r.selected);
  
  isIndeterminate = () => {
    const count = this.getSelectedCount();
    return count > 0 && count < this.dataSource().length;
  };
  
  toggleAllSelection = () => {
    const allSelected = this.isAllSelected();
    this.dataSource.update(items => items.map(i => ({ ...i, selected: !allSelected })));
  };
  
  getSelectedItems = () => this.dataSource().filter(r => r.selected);
  getSelectedCount = () => this.getSelectedItems().length;
  
  openDeleteDialog(items: ArchiveItem[]) {
    if (!items.length) return;
    
    if (this.archiveType === 'inventory') {
      const dialogRef = this.dialog.open(ArchiveInventoryDeleteDialogComponent, { 
        width: '400px', 
        data: { items, isBulk: items.length > 1 } 
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.deleteSelected();
      });
    } else {
      const dialogRef = this.dialog.open(ArchiveRequisitionDeleteDialogComponent, { 
        width: '400px', 
        data: { items, isBulk: items.length > 1 } 
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.deleteSelected();
      });
    }
  }

  async deleteSelected() {
    const selected = this.getSelectedItems();
    if (!selected.length) {
      this.snack.open('No items selected for deletion', 'OK', { duration: 3000 });
      return;
    }

    try {
      if (this.archiveType === 'inventory') {
        // For inventory, we need to use archiveId for deletion
        const archiveIds = selected.map(i => (i as InventoryArchive).archiveId);
        console.log('Deleting inventory items with archive IDs:', archiveIds);
        
        // Delete each item individually since the service expects single ID
        for (const archiveId of archiveIds) {
          await firstValueFrom(this.inventoryService.deleteInventory(archiveId));
        }
      } else {
        // For requisitions, delete one by one as per original logic
        for (const item of selected) {
          const req = item as RequisitionArchive;
          await firstValueFrom(this.requisitionsService.hardDeleteArchived(req.rfId));
        }
      }
      
      this.snack.open(`${selected.length} item(s) permanently deleted`, 'OK', { duration: 2000 });
      await this.loadArchive(); // Reload data
    } catch (error) {
      console.error('Error deleting archive items:', error);
      this.snack.open('Failed to delete selected items. Please try again.', 'OK', { duration: 3000 });
    }
  }
  
  exportCSV() {
    const rows = this.dataSource();
    if (!rows.length) {
      this.snack.open('No data to export', 'OK', { duration: 2000 });
      return;
    }

    let headers: string[] = [];
    let csvContent = '';

    if (this.archiveType === 'inventory') {
      headers = ['Archive ID', 'Item Name', 'Serial Number', 'Category', 'Quantity', 'Unit', 'Location', 'Status', 'Date Added', 'Archived Date', 'Archived Reason', 'Archived By'];
      csvContent = [
        headers.join(','),
        ...rows.map(r => {
          const item = r as InventoryArchive;
          return [
            item.archiveId,
            item.itemName,
            item.serialNumber || '',
            item.category || '',
            item.quantity,
            item.unit || '',
            item.location || '',
            item.status,
            item.dateAdded,
            item.archivedAt,
            item.archivedReason || '',
            item.archivedBy || 'System'
          ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        })
      ].join('\r\n');
    } else {
      headers = ['RF ID', 'RS Number', 'RF Number', 'Requester Name', 'Department', 'Purpose', 'Archived Date', 'Archived By'];
      csvContent = [
        headers.join(','),
        ...rows.map(r => {
          const item = r as RequisitionArchive;
          return [
            item.rfId,
            item.rsNumber || '',
            item.rfNumber || '',
            item.requesterName || '',
            item.department || '',
            item.purpose || '',
            item.archivedAt,
            item.archivedBy || 'System'
          ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
        })
      ].join('\r\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.archiveType}_archive_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.snack.open('CSV exported successfully', 'OK', { duration: 2000 });
  }

  async switchArchiveType(type: 'inventory' | 'requisition') {
    this.archiveType = type;
    // Reset search input
    const searchInput = document.querySelector('.controls-right input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    await this.loadArchive();
  }

  private isInventoryItem(item: ArchiveItem): item is InventoryArchive {
    return 'archiveId' in item && 'itemId' in item;
  }
  
  private isRequisitionItem(item: ArchiveItem): item is RequisitionArchive {
    return 'rfId' in item && !('itemId' in item);
  }
}
