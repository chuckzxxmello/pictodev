import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
// Import FormsModule here
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subscription, debounceTime, distinctUntilChanged, firstValueFrom, Subject } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import {
  RequisitionsService,
  RequisitionForm,
  SearchParams
} from '../../services/requisitions.service';

import { RequisitionAddDialogComponent } from './requisitions.add';
import { RequisitionEditDialogComponent } from './requisitions.edit';
import { RequisitionDeleteDialogComponent } from './requisitions.delete';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-requisitions',
  standalone: true,
  // Add FormsModule to the imports array
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule, 
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
              <button mat-stroked-button (click)="exportCSV()">Export CSV</button>

              <ng-container *ngIf="userRole !== 'User'">
                <button mat-stroked-button color="primary" (click)="openAddDialog()">Add</button>
                <button mat-stroked-button [disabled]="!getSelectedItem()"
                        (click)="openEditDialog(getSelectedItem()!)">Edit</button>
                <button mat-stroked-button color="warn" [disabled]="getSelectedCount()===0"
                        (click)="openDeleteDialog(getSelectedItems())">
                  Delete
                </button>
              </ng-container>

              
            </div>

            <div class="controls-right" [formGroup]="searchForm">
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Search by RS Number</mat-label>
                <input matInput formControlName="rsNumber" placeholder="Enter RS...">
              </mat-form-field>

              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Search by RF Number</mat-label>
                <input matInput formControlName="rfNumber" placeholder="Enter RF...">
              </mat-form-field>
            
              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Search by Requester</mat-label>
                <input matInput formControlName="requesterName" placeholder="Enter name...">
              </mat-form-field>

              <mat-form-field appearance="outline" subscriptSizing="dynamic">
                <mat-label>Search by Department</mat-label>
                <input matInput formControlName="department" placeholder="Enter department...">
              </mat-form-field>

            </div>
          </div>

          <div class="table-container">
              <table mat-table [dataSource]="dataSource()" class="data-table">

                <ng-container matColumnDef="select">
                  <th mat-header-cell *matHeaderCellDef>
                    <mat-checkbox [checked]="isAllSelected()" [indeterminate]="isIndeterminate()" (change)="toggleAllSelection()"></mat-checkbox>
                  </th>
                  <td mat-cell *matCellDef="let row">
                    <mat-checkbox [(ngModel)]="row.selected" (ngModelChange)="$event ? null : clearSelection()"></mat-checkbox>
                  </td>
                </ng-container>

                <ng-container matColumnDef="rfId">
                  <th mat-header-cell *matHeaderCellDef>RF ID</th>
                  <td mat-cell *matCellDef="let element">{{ element.rfId }}</td>
                </ng-container>

                <ng-container matColumnDef="rsNumber">
                  <th mat-header-cell *matHeaderCellDef>RS Number</th>
                  <td mat-cell *matCellDef="let element">{{ element.rsNumber || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="rfNumber">
                  <th mat-header-cell *matHeaderCellDef>RF Number</th>
                  <td mat-cell *matCellDef="let element">{{ element.rfNumber || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="requesterName">
                  <th mat-header-cell *matHeaderCellDef>Requester Name</th>
                  <td mat-cell *matCellDef="let element">{{ element.requesterName }}</td>
                </ng-container>

                <ng-container matColumnDef="requesterPosition">
                  <th mat-header-cell *matHeaderCellDef>Requester Position</th>
                  <td mat-cell *matCellDef="let element">{{ element.requesterPosition }}</td>
                </ng-container>

                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let element">{{ element.department }}</td>
                </ng-container>

                <ng-container matColumnDef="purpose">
                  <th mat-header-cell *matHeaderCellDef>Purpose</th>
                  <td mat-cell *matCellDef="let element">{{ element.purpose }}</td>
                </ng-container>

                <ng-container matColumnDef="dateRequested">
                  <th mat-header-cell *matHeaderCellDef>Date Requested</th>
                  <td mat-cell *matCellDef="let element">{{ element.dateRequested | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="checkedByName">
                  <th mat-header-cell *matHeaderCellDef>Checked By</th>
                  <td mat-cell *matCellDef="let element">{{ element.checkedByName || 'N/A' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="checkedByPosition">
                  <th mat-header-cell *matHeaderCellDef>Checker Position</th>
                  <td mat-cell *matCellDef="let element">{{ element.checkedByPosition || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="checkedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Checked</th>
                  <td mat-cell *matCellDef="let element">{{ element.checkedByDate | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="approvedByName">
                  <th mat-header-cell *matHeaderCellDef>Approved By</th>
                  <td mat-cell *matCellDef="let element">{{ element.approvedByName || 'N/A' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="approvedByPosition">
                  <th mat-header-cell *matHeaderCellDef>Approver Position</th>
                  <td mat-cell *matCellDef="let element">{{ element.approvedByPosition || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="approvedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Approved</th>
                  <td mat-cell *matCellDef="let element">{{ element.approvedByDate | date:'short' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="issuedByName">
                  <th mat-header-cell *matHeaderCellDef>Issued By</th>
                  <td mat-cell *matCellDef="let element">{{ element.issuedByName || 'N/A' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="issuedByPosition">
                  <th mat-header-cell *matHeaderCellDef>Issuer Position</th>
                  <td mat-cell *matCellDef="let element">{{ element.issuedByPosition || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="issuedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Issued</th>
                  <td mat-cell *matCellDef="let element">{{ element.issuedByDate | date:'short' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="receivedByName">
                  <th mat-header-cell *matHeaderCellDef>Received By</th>
                  <td mat-cell *matCellDef="let element">{{ element.receivedByName || 'N/A' }}</td>
                </ng-container>
                
                <ng-container matColumnDef="receivedByPosition">
                  <th mat-header-cell *matHeaderCellDef>Receiver Position</th>
                  <td mat-cell *matCellDef="let element">{{ element.receivedByPosition || 'N/A' }}</td>
                </ng-container>

                <ng-container matColumnDef="receivedByDate">
                  <th mat-header-cell *matHeaderCellDef>Date Received</th>
                  <td mat-cell *matCellDef="let element">{{ element.receivedByDate | date:'short' }}</td>
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
    .header-img {
      width: auto;
      height: 60px;
      padding-bottom: 10px;

    }
    .table-section { background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
    .table-controls { display:flex; justify-content:space-between; padding:20px 24px; border-bottom:1px solid #f3f4f6; flex-wrap: wrap; }
    .controls-left { display:flex; gap:8px; }
    .controls-right { display:flex; gap:8px; flex-wrap: wrap; }

    /* Apply a consistent border-radius to all buttons in the group */
    .controls-left button {
      border-radius: 10px;
      height: 47px;
    }

    /* Hover effect for the Export button */
    .export-btn:hover {
      background-color: #28a745 !important; /* Green */
      color: white !important;
    }

    /* Hover effect for the Add button */
    .add-btn:hover {
      background-color: #253c90 !important; /* Blue */
      color: white !important;
    }

    /* Hover effect for the Edit button */
    .edit-btn:hover {
      background-color: #ffc005ff !important; /* Yellow */
      color: black !important;
    }

    /* Hover effect for the Delete button */
    .delete-btn:hover {
      background-color: #dc3545 !important; /* Red */
      color: white !important;
    }

    .table-container { overflow-x:auto; }
    .data-table { width:100%; border-spacing:0; font-size:0.875rem; }
    .data-table th { background:#f9fafb; padding:16px 12px; font-weight:600; border-bottom:2px solid #e5e7eb; text-align:left; }
    .data-table td { padding:12px; border-bottom:1px solid #f3f4f6; }
    .selected-row { background-color:#eff6ff !important; }
    .data-table tr:hover { background-color:#f9fafb; }

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

    .search-icon-container {
      padding: 0 10px;
    }

    .search-icon {
      width: 20px;
      height: 20px;
      fill: #000000ff;
    }
  `]
})
export class Requisitions implements OnInit, OnDestroy {
  private service = inject(RequisitionsService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  private subscriptions = new Subscription();
  userRole = ''; // track role
  currentUser = this.auth.getCurrentUser();

    ngOnInit() {
    try {
      // Get role from AuthService
      const user = this.auth.getCurrentUser(); // use 'auth' instead of 'authService'
      this.userRole = (user?.role as 'User' | 'Manager' | 'Admin') || '';

      // Load requisitions
      this.loadRequisitions();

      // Setup search form listener
      const searchSub = this.searchForm.valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged()
      ).subscribe(() => {
        this.searchRequisitions();
      });
      this.subscriptions.add(searchSub);
    } catch (error) {
      console.error('Error loading requisitions:', error);
      this.snack.open('Error loading requisitions', 'OK', { duration: 3000 });
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Role helper
  isUser(): boolean {
    return this.userRole === 'User';
  }
  isManager(): boolean {
    return this.userRole === 'Manager';
  }
  isAdmin(): boolean {
    return this.userRole === 'Admin';
  }

  isCollapsed = false;
  dataSource = signal<RequisitionForm[]>([]);
  displayedColumns = [
    'select', 
    'rfId', 
    'rsNumber', 
    'rfNumber', 
    'requesterName', 
    'requesterPosition', 
    'department', 
    'purpose', 
    'dateRequested', 
    'checkedByName', 
    'checkedByPosition', 
    'checkedByDate', 
    'approvedByName', 
    'approvedByPosition', 
    'approvedByDate', 
    'issuedByName', 
    'issuedByPosition', 
    'issuedByDate', 
    'receivedByName', 
    'receivedByPosition', 
    'receivedByDate',
  ];
  
  searchForm = this.fb.group({
    requesterName: [''],
    department: [''],
    rsNumber: [''],
    rfNumber: [''],
    startDate: [''],
    endDate: ['']
  });

  async loadRequisitions() {
    try {
      this.searchForm.reset({ 
        requesterName: '', 
        department: '', 
        rsNumber: '', 
        rfNumber: '', 
      }, { emitEvent: false });
      const requisitions = await firstValueFrom(this.service.getAll());
      this.dataSource.set(requisitions.map(r => ({ ...r, selected: false })));
    } catch (error) {
      console.error(error);
      this.snack.open('Error loading requisitions', 'OK', { duration: 3000 });
    }
  }

  searchRequisitions() {
    const raw = this.searchForm.getRawValue();
    const params: SearchParams = {
        requesterName: raw.requesterName || undefined,
        department: raw.department || undefined,
        rsNumber: raw.rsNumber || undefined,
        rfNumber: raw.rfNumber || undefined,
    };

    // Remove empty properties
    Object.keys(params).forEach(key => 
        (params as any)[key] === undefined && delete (params as any)[key]
    );

    this.service.search(params).subscribe({
        next: (requisitions) => this.dataSource.set(requisitions.map(r => ({ ...r, selected: false }))),
        error: (e) => this.snack.open('Failed to perform search', 'OK', { duration: 3000 })
    });
}

  /** --- Add Dialog --- */
  openAddDialog() {
    const dialogRef = this.dialog.open(RequisitionAddDialogComponent, { width: '600px', disableClose: true });
    dialogRef.afterClosed().subscribe((payload?: Partial<RequisitionForm>) => {
      if (payload) this.addRequisition(payload);
    });
  }

  private addRequisition(data: Partial<RequisitionForm>) {
    this.service.create(data).subscribe({
      next: r => {
        this.dataSource.set([r, ...this.dataSource()]);
        this.snack.open('Requisition added successfully', 'OK', { duration: 2000 });
      },
      error: e => {
        console.error(e);
        this.snack.open('Failed to add requisition', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Edit Dialog --- */
  openEditDialog(item: RequisitionForm) {
    const dialogRef = this.dialog.open(RequisitionEditDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { item }
    });
    dialogRef.afterClosed().subscribe((payload?: Partial<RequisitionForm>) => {
      if (payload) this.updateRequisition(item.rfId, payload);
    });
  }

  private updateRequisition(id: string, data: Partial<RequisitionForm>) {
    this.service.update(id, data).subscribe({
      next: r => {
        // Find the item in the data source and update it with the DATA you sent,
        // not the potentially incomplete RESPONSE 'r' from the server.
        this.dataSource.set(this.dataSource().map(x => 
          x.rfId === id ? { ...x, ...data, selected: x.selected } : x // <-- CHANGE 'r' TO 'data' HERE
        ));
        this.snack.open('Updated successfully', 'OK', { duration: 2000 });
      },
      error: e => {
        console.error(e);
        this.snack.open('Failed to update', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Delete (Archive) --- */
  openDeleteDialog(items: RequisitionForm[]) {
    if (!items.length) return;
    const dialogRef = this.dialog.open(RequisitionDeleteDialogComponent, {
      width: '480px',
      data: { items, isBulk: items.length > 1 }
    });
    dialogRef.afterClosed().subscribe(confirm => { if (confirm) this.deleteSelected(items); });
  }

  deleteSelected(items: RequisitionForm[]) {
    const ids = items.map(x => x.rfId);
    if (ids.length === 0) return;
  
    const archivedBy = this.currentUser?.username || 'Unknown User';

    const deleteObs = ids.length === 1
      ? this.service.delete(ids[0], `Archived by ${archivedBy}`, archivedBy)
      : this.service.deleteBulk(ids, `Bulk archived by ${archivedBy}`, archivedBy);
  
    deleteObs.subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(x => !ids.includes(x.rfId)));
        const message = ids.length === 1 ? 'Archived successfully' : `Archived ${ids.length} requisitions`;
        this.snack.open(message, 'OK', { duration: 2000 });
      },
      error: e => {
        console.error('Failed to archive', e);
        this.snack.open('Failed to archive requisition(s)', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Selection Methods --- */
  isAllSelected() { return this.dataSource().length > 0 && this.dataSource().every(r => r.selected); }
  isIndeterminate() { const c = this.getSelectedCount(); return c > 0 && c < this.dataSource().length; }
  toggleAllSelection() { const allSelected = this.isAllSelected(); this.dataSource.update(values => values.map(r => ({ ...r, selected: !allSelected }))); }
  getSelectedCount() { return this.dataSource().filter(r => r.selected).length; }
  getSelectedItem() {
    const selected = this.dataSource().filter(r => r.selected);
    return selected.length === 1 ? selected[0] : null;
  }
  getSelectedItems() { return this.dataSource().filter(r => r.selected); }
  clearSelection() {
    this.dataSource.update(values => values.map(r => ({...r, selected: false})));
  }

  /** --- Export --- */
  exportCSV() {
    const rows = this.dataSource();
    if (rows.length === 0) {
      this.snack.open('No data to export', 'OK', { duration: 2000 });
      return;
    }

    const headers = [
      'rfId', 'rsNumber', 'rfNumber', 'requesterName', 'requesterPosition', 'department',
      'purpose', 'dateRequested', 'workflowStatus', 'checkedByName', 'checkedByPosition', 'checkedByDate',
      'approvedByName', 'approvedByPosition', 'approvedByDate', 'issuedByName', 'issuedByPosition',
      'issuedByDate', 'receivedByName', 'receivedByPosition', 'receivedByDate'
    ];
    
    const formatDate = (dateString: string | undefined) => {
      return dateString ? new Date(dateString).toLocaleString() : '';
    };

    const csvRows = rows.map(row => [
      row.rfId,
      row.rsNumber,
      row.rfNumber,
      row.requesterName,
      row.requesterPosition,
      row.department,
      row.purpose,
      formatDate(row.dateRequested),
      row.workflowStatus,
      row.checkedByName,
      row.checkedByPosition,
      formatDate(row.checkedByDate),
      row.approvedByName,
      row.approvedByPosition,
      formatDate(row.approvedByDate),
      row.issuedByName,
      row.issuedByPosition,
      formatDate(row.issuedByDate),
      row.receivedByName,
      row.receivedByPosition,
      formatDate(row.receivedByDate),
    ].map(value => `"${String(value || '').replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `requisitions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    this.snack.open('CSV exported successfully', 'OK', { duration: 2000 });
  }
}
