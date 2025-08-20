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

import { PictoInventory, InventoryService } from '../../services/inventory.service';
import { RequisitionArchive, RequisitionService } from '../../services/requisition.service';
import { ArchiveInventoryDeleteDialogComponent } from './archive.inventory.delete';
import { ArchiveRequisitionDeleteDialogComponent } from './archive.requisition.delete';

type ArchiveItem = (PictoInventory | RequisitionArchive) & { selected?: boolean };

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

          <!-- Table Controls -->
          <div class="table-controls">
            <div class="controls-left">
              <button mat-stroked-button class="export-btn" (click)="exportCSV()">Export</button>
              <button mat-stroked-button
                      [disabled]="getSelectedCount() === 0"
                      (click)="openDeleteDialog(getSelectedItems())"
                      color="warn">
                {{ getSelectedCount() === dataSource().length ? 'Delete All' : 'Delete' }}
              </button>
            </div>
            <div class="controls-right">
              <input type="text" placeholder="Search..." (input)="onSearch($event)">
            </div>
          </div>

          <!-- Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource()" class="data-table">

              <!-- Select Column -->
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

              <!-- Inventory Columns -->
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

              <ng-container matColumnDef="rfId">
                <th mat-header-cell *matHeaderCellDef>RF ID</th>
                <td mat-cell *matCellDef="let element">{{element.rfId}}</td>
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

              <ng-container matColumnDef="dateRequested">
                <th mat-header-cell *matHeaderCellDef>Date Requested</th>
                <td mat-cell *matCellDef="let element">{{element.dateRequested | date:'mediumDate'}}</td>
              </ng-container>

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

              <!-- Table Rows -->
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
    .layout { display:flex; height:100vh; transition: all 0.3s ease; }
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
    .table-controls { display:flex; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f3f4f6; }
    .controls-left { display:flex; gap:8px; }
    .table-container { overflow-x:auto; }
    .data-table { width:100%; border-spacing:0; font-size:0.875rem; }
    .data-table th { background:#f9fafb; padding:16px 12px; font-weight:600; border-bottom:2px solid #e5e7eb; text-align:left; }
    .data-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .selected-row { background-color:#eff6ff !important; }
    .data-table tr:hover { background-color:#f9fafb; }
    .header-img {  width: auto;  height: 50px; }
  `]
})

export class Archive implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private requisitionService = inject(RequisitionService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  isCollapsed = false;
  archiveType: 'inventory' | 'requisition' = 'inventory';
  dataSource = signal<ArchiveItem[]>([]);
  originalDataSource: ArchiveItem[] = [];
  displayedColumns: string[] = [];
  subscriptions = new Subscription();

  filterDateFrom: string = '';
  filterDateTo: string = '';
  filterSearch: string = '';

  toggleSidebar() { this.isCollapsed = !this.isCollapsed; }

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
        const inventoryWithSelection = inventory.map(item => ({ ...item, selected: false }));
        this.dataSource.set([...inventoryWithSelection]);
        this.originalDataSource = [...inventoryWithSelection];
        this.displayedColumns = ['select','serialNumber','itemName','description','category','quantity','unit','location','status','dateAdded'];
      } else {
        const requisitions = await firstValueFrom(this.requisitionService.getAllArchived());
        const requisitionsWithSelection = requisitions.map(item => ({ ...item, selected: false }));
        this.dataSource.set([...requisitionsWithSelection]);
        this.originalDataSource = [...requisitionsWithSelection];
        this.displayedColumns = ['select','rfId','requesterName','department','purpose','dateRequested'];
      }
    } catch (error) {
      console.error('Error loading archive:', error);
      this.snack.open('Error loading archive', 'OK', { duration: 3000 });
    }
  }

  /** --- Filtering --- */
  onSearch(event?: Event): void {  // Add explicit void return type
  // Extract value from event if provided
  if (event) {
    const target = event.target as HTMLInputElement;
    this.filterSearch = target.value;
  }

  let filtered = [...this.originalDataSource];

  if (this.filterSearch) {
    const val = this.filterSearch.toLowerCase();
    filtered = filtered.filter(i => {
      if (this.archiveType === 'inventory') {
        const inv = i as PictoInventory;
        return inv.itemName.toLowerCase().includes(val) ||
               (inv.serialNumber?.toLowerCase().includes(val) ?? false);
      } else {
        const req = i as RequisitionArchive;
        return req.rfId.toLowerCase().includes(val) ||
               req.requesterName.toLowerCase().includes(val);
      }
    });
  }

  if (this.filterDateFrom || this.filterDateTo) {
    const from = this.filterDateFrom ? new Date(this.filterDateFrom) : new Date('1970-01-01');
    const to = this.filterDateTo ? new Date(this.filterDateTo) : new Date();
    filtered = filtered.filter(i => {
      const date = this.archiveType === 'inventory' 
        ? new Date((i as PictoInventory).dateAdded) 
        : new Date((i as RequisitionArchive).dateRequested);
      return date >= from && date <= to;
    });
  }

  this.dataSource.set(filtered);
  }

  /** --- Selection --- */
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
  
  getSelectedItems(): ArchiveItem[] {
    return this.dataSource().filter(r => r.selected);
  }

  getSelectedCount(): number {
    return this.getSelectedItems().length;
  }

  /** --- Delete Dialog --- */
  openDeleteDialog(items: ArchiveItem[]) {
    if (!items || !items.length) return;
    const isBulk = items.length > 1;
    const dialogComponent: any = this.archiveType === 'inventory'
      ? ArchiveInventoryDeleteDialogComponent
      : ArchiveRequisitionDeleteDialogComponent;

    const dialogRef = this.dialog.open(dialogComponent, { width: '400px', data: { items, isBulk } });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.deleteSelected();
    });
  }

  async deleteSelected() {
    const selected = this.getSelectedItems();
    if (!selected.length) return;

    try {
      if (this.archiveType === 'inventory') {
        const ids = selected.map(i => (i as PictoInventory).itemId);
        await firstValueFrom(this.inventoryService.hardDeleteArchived(ids));
        this.snack.open(`${ids.length} inventory item(s) deleted`, 'OK', { duration: 2000 });
      } else {
        const ids = selected.map(i => (i as RequisitionArchive).rfId);
        await firstValueFrom(this.requisitionService.hardDeleteArchived(ids));
        this.snack.open(`${ids.length} requisition(s) deleted`, 'OK', { duration: 2000 });
      }
      this.dataSource.set(this.dataSource().filter(i => !i.selected));
      this.originalDataSource = this.originalDataSource.filter(i => !i.selected);
    } catch (error) {
      console.error('Error deleting archive items:', error);
      this.snack.open('Failed to delete selected items', 'OK', { duration: 3000 });
    }
  }

  /** --- Export CSV --- */
  exportCSV(): void {  // Add explicit void return type
  const rows = this.dataSource();
  if (!rows.length) {
    this.snack.open('No data to export', 'OK', { duration: 2000 });
    return; // Add explicit return
  }

  let headers: string[] = [];
  let csvRows: string[][] = [];

  if (this.archiveType === 'inventory') {
    headers = ['ID','Serial Number','Name','Description','Category','Quantity','Unit','Location','Status','Date Added'];
    csvRows = rows.map(r => {
      const i = r as PictoInventory;
      return [
        String(i.itemId ?? ''),
        String(i.serialNumber ?? ''),
        String(i.itemName ?? ''),
        String(i.description ?? ''),
        String(i.category ?? ''),
        String(i.quantity ?? ''),
        String(i.unit ?? ''),
        String(i.location ?? ''),
        String(i.status ?? ''),
        String(i.dateAdded ?? '')
      ];
    });
  } else {
    headers = ['RF ID','Requester','Department','Purpose','Date Requested'];
    csvRows = rows.map(r => {
      const i = r as RequisitionArchive;
      return [
        String(i.rfId ?? ''),
        String(i.requesterName ?? ''),
        String(i.department ?? ''),
        String(i.purpose ?? ''),
        String(i.dateRequested ?? '')
      ];
    });
  }

  const csvContent = [
    headers.join(','),
    ...csvRows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${this.archiveType}_archive_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  this.snack.open('CSV exported successfully', 'OK', { duration: 2000 });
}

async switchArchiveType(type: 'inventory' | 'requisition'): Promise<void> {
  this.archiveType = type;
  this.filterSearch = '';
  this.filterDateFrom = '';
  this.filterDateTo = '';
  await this.loadArchive();
}

// Issue 6: Add proper error handling for date filtering
private isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Issue 7: Improved type safety for archiveType check
private isInventoryItem(item: ArchiveItem): item is PictoInventory {
  return 'itemId' in item;
}

private isRequisitionItem(item: ArchiveItem): item is RequisitionArchive {
  return 'rfId' in item;
}
}