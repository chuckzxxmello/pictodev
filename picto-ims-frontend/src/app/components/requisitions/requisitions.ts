import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import { 
  RequisitionsService, 
  Requisition, 
  CreateRequisitionRequest, 
  UpdateRequisitionRequest 
} from '../../services/requisitions.service';

import { RequisitionAddDialogComponent } from './requisitions.add';
import { RequisitionEditDialogComponent } from './requisitions.edit';
import { RequisitionDeleteDialogComponent } from './requisitions.delete';

@Component({
  selector: 'app-requisitions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent
  ],
  template: `
  <div class="layout">
    <app-sidebar [class.collapsed]="isCollapsed" (toggle)="isCollapsed = !isCollapsed"></app-sidebar>

    <div class="content">
      <header class="top-header">
        <div class="header-left">
          <h2>Requisitions</h2>
        </div>
        <div class="header-right">
          <img src="assets/images/header-right.png" alt="pgc logo" class="header-img">
        </div>
      </header>

      <div class="content-area">
        <div class="table-section">
          <div class="table-controls">
            <div class="controls-left">
              <button mat-stroked-button (click)="exportCSV()">Export</button>
              <button mat-stroked-button (click)="openAddDialog()">Add</button>
              <button mat-stroked-button [disabled]="!getSelectedItem()" 
                      (click)="openEditDialog(getSelectedItem()!)">Edit</button>
              <button mat-stroked-button [disabled]="getSelectedCount()===0" color="warn"
                      (click)="openDeleteDialog(getSelectedItems())">
                {{ getSelectedCount()===dataSource().length ? 'Delete All' : 'Delete' }}
              </button>
            </div>
            <div class="controls-right">
              <input type="text" placeholder="Search..." (input)="onSearch($event)">
            </div>
          </div>

          <div class="table-container">
              <table mat-table [dataSource]="dataSource()" class="data-table">
                
                <!-- Selection Column -->
                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox [checked]="isAllSelected()" [indeterminate]="isIndeterminate()" (change)="toggleAllSelection()"></mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let row">
                    <mat-checkbox [(ngModel)]="row.selected"></mat-checkbox>
                  </td>
                </ng-container>

                <!-- RFID Column -->
                <ng-container matColumnDef="rfId">
                  <th mat-header-cell *matHeaderCellDef>RFID</th>
                  <td mat-cell *matCellDef="let element">{{ element.rfId }}</td>
                </ng-container>

                <!-- Requester Column -->
                <ng-container matColumnDef="requesterName">
                  <th mat-header-cell *matHeaderCellDef>Requester</th>
                  <td mat-cell *matCellDef="let element">{{ element.requesterName }}</td> <!-- Updated -->
                </ng-container>

                <!-- Department Column -->
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let element">{{ element.department }}</td>
                </ng-container>

                <!-- Purpose Column -->
                <ng-container matColumnDef="purpose">
                  <th mat-header-cell *matHeaderCellDef>Purpose</th>
                  <td mat-cell *matCellDef="let element">{{ element.purpose }}</td>
                </ng-container>

                <!-- Date Requested Column -->
                <ng-container matColumnDef="dateRequested">
                  <th mat-header-cell *matHeaderCellDef>Date Requested</th>
                  <td mat-cell *matCellDef="let element">{{ element.dateRequested | date:'mediumDate' }}</td>
                </ng-container>

                <!-- Checked By Column -->
                <ng-container matColumnDef="checkedByName">
                  <th mat-header-cell *matHeaderCellDef>Checked By</th>
                  <td mat-cell *matCellDef="let element">{{ element.checkedByName }}</td>
                </ng-container>

                <!-- Approved By Column -->
                <ng-container matColumnDef="approvedByName">
                  <th mat-header-cell *matHeaderCellDef>Approved By</th>
                  <td mat-cell *matCellDef="let element">{{ element.approvedByName }}</td>
                </ng-container>

                <!-- Issued By Column -->
                <ng-container matColumnDef="issuedByName">
                  <th mat-header-cell *matHeaderCellDef>Issued By</th>
                  <td mat-cell *matCellDef="let element">{{ element.issuedByName }}</td>
                </ng-container>

                <!-- Received By Column -->
                <ng-container matColumnDef="receivedByName">
                  <th mat-header-cell *matHeaderCellDef>Received By</th>
                  <td mat-cell *matCellDef="let element">{{ element.receivedByName }}</td>
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
    /* Similar styling as inventory example */
    .layout { display:flex; height:100vh; }
    .content { flex:1; padding:10px; width:100%; }
    .top-header { height:60px; display:flex; align-items:center; padding:0 24px; border-bottom:1px solid #e5e7eb; }
    .content-area { padding:24px; flex:1; }
    .header-img {  width: auto;  height: 50px; }
    .table-section { background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
    .table-controls { display:flex; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f3f4f6; }
    .controls-left { display:flex; gap:8px; }
    .table-container { overflow-x:auto; }
    .data-table { width:100%; border-spacing:0; font-size:0.875rem; }
    .data-table th { background:#f9fafb; padding:16px 12px; font-weight:600; border-bottom:2px solid #e5e7eb; text-align:left; }
    .data-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .selected-row { background-color:#eff6ff !important; }
    .data-table tr:hover { background-color:#f9fafb; }
  `]
})


export class Requisitions implements OnInit, OnDestroy {
  private service = inject(RequisitionsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  isCollapsed = false;
  dataSource = signal<Requisition[]>([]);
  originalDataSource: Requisition[] = [];
  displayedColumns = [
  'select', 'rfId', 'requesterName', 'department', 'purpose', 
  'dateRequested', 'checkedByName', 'approvedByName', 'issuedByName', 'receivedByName'
  ];

  private subscriptions = new Subscription();

  async ngOnInit() {
    try {
      const requisitions = await firstValueFrom(this.service.getAll());
      this.dataSource.set([...requisitions]);
      this.originalDataSource = [...requisitions];
    } catch (error) {
      console.error(error);
      this.snack.open('Error loading requisitions', 'OK', { duration: 3000 });
    }
  }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }

  /** --- Search --- */
  onSearch(event: Event) {
  const val = (event.target as HTMLInputElement).value.toLowerCase();
  if (!val) {
    this.dataSource.set([...this.originalDataSource]);
    return;
  }

  this.dataSource.set(this.originalDataSource.filter(r =>
    r.rfId.toLowerCase().includes(val) ||    // 👈 added for rfId search
    r.requesterName.toLowerCase().includes(val) ||
    r.requesterPosition?.toLowerCase().includes(val) ||
    r.department.toLowerCase().includes(val) ||
    r.purpose?.toLowerCase().includes(val) ||
    r.checkedByName?.toLowerCase().includes(val) ||
    r.approvedByName?.toLowerCase().includes(val) ||
    r.issuedByName?.toLowerCase().includes(val) ||
    r.receivedByName?.toLowerCase().includes(val)
  ));
  }

  /** --- Add Dialog --- */
  openAddDialog() {
    const dialogRef = this.dialog.open(RequisitionAddDialogComponent, { width: '600px', disableClose: true });
    dialogRef.afterClosed().subscribe((payload?: CreateRequisitionRequest) => {
      if (payload) this.addRequisition(payload);
    });
  }

  private addRequisition(data: CreateRequisitionRequest) {
    this.service.create(data).subscribe({
      next: r => {
        this.dataSource.set([r, ...this.dataSource()]);
        this.originalDataSource.push(r);
        this.snack.open('Added successfully', 'OK', { duration: 2000 });
      },
      error: e => {
        console.error(e);
        this.snack.open('Failed to add', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Edit Dialog --- */
  openEditDialog(item: Requisition) {
  const dialogRef = this.dialog.open(RequisitionEditDialogComponent, {
    width: '600px',
    disableClose: true,
    data: { item }
  });
  dialogRef.afterClosed().subscribe((payload?: UpdateRequisitionRequest) => {
    if (payload) this.updateRequisition(item.rfId, payload); // 👈 keep string
  });
  }

  private updateRequisition(id: string, data: Requisition) {
  this.service.update(id, data).subscribe({
    next: r => {
      this.dataSource.set(
        this.dataSource().map(x => x.rfId === id ? { ...x, ...r } : x)
      );
      this.originalDataSource = this.originalDataSource.map(
        x => x.rfId === id ? { ...x, ...r } : x
      );
      this.snack.open('Updated successfully', 'OK', { duration: 2000 });
    },
    error: e => {
      console.error(e);
      this.snack.open('Failed to update', 'OK', { duration: 3000 });
    }
  });
  }

  /** --- Delete --- */
  openDeleteDialog(items: Requisition[]) {
    if (!items.length) return;
    const dialogRef = this.dialog.open(RequisitionDeleteDialogComponent, { width: '480px', data: { items, isBulk: items.length > 1 } });
    dialogRef.afterClosed().subscribe(confirm => { if (confirm) this.deleteSelected(items); });
  }

  deleteSelected(items: Requisition[]) {
  const ids = items.map(x => x.rfId);
  if (!ids.length) return;

  if (ids.length === 1) {
    this.service.delete(ids[0]).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(x => x.rfId !== ids[0]));
        this.originalDataSource = this.originalDataSource.filter(x => x.rfId !== ids[0]);
        this.snack.open('Deleted successfully', 'OK', { duration: 2000 });
      },
      error: e => {
        console.error('Failed to delete', e);
        this.snack.open('Failed to delete requisition', 'OK', { duration: 3000 });
      }
    });
  } else {
    this.service.deleteBulk(ids).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(x => !ids.includes(x.rfId)));
        this.originalDataSource = this.originalDataSource.filter(x => !ids.includes(x.rfId));
        this.snack.open(`Deleted ${ids.length} requisitions`, 'OK', { duration: 2000 });
      },
      error: e => {
        console.error('Failed bulk delete', e);
        this.snack.open('Failed to delete selected requisitions', 'OK', { duration: 3000 });
      }
    });
  }
  }

  /** --- Selection Methods --- */
  isAllSelected() { return this.dataSource().length && this.dataSource().every(r => r.selected); }
  isIndeterminate() { const c = this.dataSource().filter(r => r.selected).length; return c > 0 && c < this.dataSource().length; }
  toggleAllSelection() { const all = this.isAllSelected(); this.dataSource().forEach(r => r.selected = !all); }
  getSelectedCount() { return this.dataSource().filter(r => r.selected).length; }
  getSelectedItem() { return this.dataSource().find(r => r.selected) || null; }
  getSelectedItems() { return this.dataSource().filter(r => r.selected); }

  exportCSV() {
  const rows = this.dataSource();
  if (!rows.length) {
    this.snack.open('No data to export', 'OK', { duration: 2000 });
    return;
  }

  const headers = [
    'rfId', 'requesterName', 'requesterPosition', 'department', 'purpose',
    'dateRequested', 'checkedByName', 'approvedByName', 'issuedByName', 'receivedByName'
  ];

  const csvRows = rows.map(row => [
    row.rfId,
    row.requesterName,
    row.requesterPosition,
    row.department,
    row.purpose || '',
    row.dateRequested ? new Date(row.dateRequested).toLocaleDateString() : 'N/A',
    row.checkedByName || 'N/A',
    row.approvedByName || 'N/A',
    row.issuedByName || 'N/A',
    row.receivedByName || 'N/A'
  ]);

  const csv = [
    headers.join(','),
    ...csvRows.map((r: any[]) => r.map((value: unknown) => `"${value}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `requisitions_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);

  this.snack.open('CSV exported', 'OK', { duration: 2000 });
  }
}