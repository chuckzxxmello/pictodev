import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { SidebarComponent } from '../../sidebar/sidebar.components';
import { UserService, UserData, CreateUserRequest, UpdateUserRequest } from '../../services/users.service';

import { UserAddDialogComponent } from './users.add';
import { UserEditDialogComponent } from './users.edit';
import { UserDeleteDialogComponent } from './users.delete';

@Component({
  selector: 'app-users',
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
          <h2>User Management</h2>
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
              <button mat-stroked-button color="primary" class="add-btn" (click)="openAddDialog()">
                Add
              </button>
              <button mat-stroked-button class="edit-btn"
                      [disabled]="!getSelectedUser()"
                      (click)="openEditDialog(getSelectedUser()!)">
                Edit
              </button>
              <button mat-stroked-button
                      [disabled]="getSelectedCount() === 0"
                      (click)="openDeleteDialog(getSelectedUsers())"
                      color="warn">
                {{ getSelectedCount() === dataSource().length && dataSource().length > 1 ? 'Delete All' : 'Delete' }}
                {{ getSelectedCount() > 1 ? '(' + getSelectedCount() + ')' : '' }}
              </button>
              <!--
              <button mat-stroked-button class="export-btn" (click)="exportCSV()">
                Export
              </button>
-->
            </div>
            <div class="controls-right">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Search users...</mat-label>
                <input matInput (input)="onSearch($event)" placeholder="Name, username, email">
              </mat-form-field>
            </div>
          </div>

          <!-- Statistics Cards -->
          <div class="stats-cards">
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-number">{{ dataSource().length }}</span>
                <span class="stat-label">Total Users</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-number">{{ getUsersByRole('Admin').length }}</span>
                <span class="stat-label">Admins</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-number">{{ getUsersByRole('Manager').length }}</span>
                <span class="stat-label">Managers</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-number">{{ getUsersByRole('User').length }}</span>
                <span class="stat-label">Users</span>
              </div>
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

              <!-- User Columns -->
              <ng-container matColumnDef="userId">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let element">{{ element.userId }}</td>
              </ng-container>

              <ng-container matColumnDef="username">
                <th mat-header-cell *matHeaderCellDef>Username</th>
                <td mat-cell *matCellDef="let element">
                  <div class="user-cell">
                    <span class="username">{{ element.username }}</span>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef>Full Name</th>
                <td mat-cell *matCellDef="let element">{{ element.fullName }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let element">
                  <span class="email">{{ element.email || '-' }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let element">{{ element.phone || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Role</th>
                <td mat-cell *matCellDef="let element">
                  <span class="role-badge"
                        [class]="getRoleClass(element.role)">
                    {{ element.role }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="dateCreated">
                <th mat-header-cell *matHeaderCellDef>Date Created</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.dateCreated | date:'mediumDate' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button (click)="openEditDialog(element)" matTooltip="Edit User">
                    <mat-icon>+</mat-icon>
                  </button>
                  <button mat-icon-button (click)="openDeleteDialog([element])" matTooltip="Delete User" color="warn">
                    <mat-icon>-</mat-icon>
                  </button>
                </td>
              </ng-container>

              <!-- Table Rows -->
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                  [class.selected-row]="row.selected"
                  (click)="toggleRowSelection(row)"></tr>

            </table>

            <div *ngIf="dataSource().length === 0" class="empty-state">
              <mat-icon class="empty-icon">group_off</mat-icon>
              <h3>No Users Found</h3>
              <p>Get started by adding your first user.</p>
              <button mat-raised-button color="primary" (click)="openAddDialog()">
                Add New User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`,
  styles: [`
    .layout { 
      display: flex; 
      height: 100vh; 
      transition: all 0.3s ease; 
    }
    
    .content { 
      flex: 1; 
      padding: 10px; 
      width: 100%; 
      background: #f5f7fa;
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
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .header-img {  
      width: auto;  
      height: 50px; 
    }
    
    .content-area { 
      padding: 0 24px 24px; 
      flex: 1; 
    }
    
    .table-section { 
      background: white; 
      border-radius: 12px; 
      overflow: hidden; 
      border: 1px solid #e5e7eb;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
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
      gap: 12px; 
      align-items: center;
    }
    
    .controls-right {
      min-width: 300px;
    }
    
    .search-field {
      width: 100%;
    }
    
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .edit-btn, .export-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px 24px;
      background: #f8f9fa;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .stat-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      transition: transform 0.2s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .stat-icon {
      font-size: 32px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    
    .stat-icon.total { color: #1976d2; background: #e3f2fd; }
    .stat-icon.admin { color: #d32f2f; background: #ffebee; }
    .stat-icon.manager { color: #f57c00; background: #fff3e0; }
    .stat-icon.user { color: #388e3c; background: #e8f5e8; }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    
    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .table-container { 
      overflow-x: auto; 
      position: relative;
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
      background-color: #f8f9fa; 
      cursor: pointer;
    }
    
    .selected-row { 
      background-color: #e3f2fd !important; 
    }
    
    .user-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .user-avatar {
      color: #666;
      font-size: 20px;
    }
    
    .username {
      font-weight: 500;
      color: #1976d2;
    }
    
    .email {
      color: #666;
      font-size: 0.875rem;
    }
    
    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .role-badge.admin {
      background: #ffebee;
      color: #d32f2f;
    }
    
    .role-badge.manager {
      background: #fff3e0;
      color: #f57c00;
    }
    
    .role-badge.user {
      background: #e8f5e8;
      color: #388e3c;
    }
    
    .role-badge.viewer {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    
    .role-icon {
      font-size: 14px !important;
      width: 14px;
      height: 14px;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
      color: #666;
    }
    
    .empty-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #333;
    }
    
    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .table-controls {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
      
      .controls-left {
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .stats-cards {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})

export class Users implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  isCollapsed = false;
  dataSource = signal<UserData[]>([]);
  originalDataSource: UserData[] = [];
  displayedColumns = ['select', 'username', 'fullName', 'email', 'phone', 'role', 'dateCreated', 'actions'];
  private subscriptions = new Subscription();

  async ngOnInit() {
    await this.loadUsers();
  }

  ngOnDestroy() { 
    this.subscriptions.unsubscribe(); 
  }

  private async loadUsers() {
    try {
      const users = await firstValueFrom(this.userService.getAllUsers());
      this.dataSource.set([...users]);
      this.originalDataSource = [...users];
    } catch (error) {
      console.error('Error loading users:', error);
      this.snack.open('Error loading users', 'OK', { duration: 3000 });
    }
  }

  /** --- Search --- */
  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = target.value.toLowerCase();
    if (!val) { 
      this.dataSource.set([...this.originalDataSource]); 
      return; 
    }
    this.dataSource.set(this.originalDataSource.filter(user => 
      user.fullName.toLowerCase().includes(val) || 
      user.username.toLowerCase().includes(val) ||
      (user.email && user.email.toLowerCase().includes(val))
    ));
  }

  /** --- Role Utilities --- */
  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Admin': return 'admin_panel_settings';
      case 'Manager': return 'manage_accounts';
      case 'User': return 'person';
      case 'Viewer': return 'visibility';
      default: return 'person';
    }
  }

  getUsersByRole(role: string): UserData[] {
    return this.dataSource().filter(user => user.role === role);
  }

  /** --- Add Dialog --- */
  openAddDialog() {
    const dialogRef = this.dialog.open(UserAddDialogComponent, {
      width: '600px',
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addNewUser(result);
      }
    });
  }

  private addNewUser(userData: CreateUserRequest) {
    if (!userData.username?.trim()) {
      this.snack.open('Username is required', 'OK', { duration: 3000 });
      return;
    }

    if (!userData.fullName?.trim()) {
      this.snack.open('Full name is required', 'OK', { duration: 3000 });
      return;
    }

    this.userService.createUser(userData).subscribe({
      next: (createdUser) => {
        this.dataSource.set([createdUser, ...this.dataSource()]);
        this.originalDataSource.unshift(createdUser);
        this.snack.open('User added successfully', 'OK', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error adding user:', err);
        this.snack.open(err.message || 'Failed to add user', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Edit Dialog --- */
  openEditDialog(user: UserData) {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateUser(user.userId, result);
      }
    });
  }

  private updateUser(userId: string, updatedData: UpdateUserRequest) {
    if (!updatedData?.username?.trim()) {
      this.snack.open('Username is required', 'OK', { duration: 3000 });
      return;
    }

    this.userService.updateUser(userId, updatedData).subscribe({
      next: (updatedUser) => {
        this.dataSource.set(
          this.dataSource().map(u => u.userId === userId ? { ...updatedUser, selected: u.selected } : u)
        );

        this.originalDataSource = this.originalDataSource.map(u =>
          u.userId === userId ? { ...updatedUser, selected: u.selected } : u
        );

        this.snack.open('User updated successfully', 'OK', { duration: 2000 });
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.snack.open(err.message || 'Failed to update user', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Delete Dialog --- */
  openDeleteDialog(users: UserData[] | null) {
    if (!users || !users.length) return;

    const isBulk = users.length > 1;

    const dialogRef = this.dialog.open(UserDeleteDialogComponent, {
      width: '500px',
      data: { users, isBulk }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (isBulk) {
          this.deleteSelected();
        } else {
          this.deleteUser(users[0].userId);
        }
      }
    });
  }

  private deleteUser(userId: string) {
    if (!userId) {
      this.snack.open('Invalid user ID', 'OK', { duration: 3000 });
      return;
    }

    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(u => u.userId !== userId));
        this.originalDataSource = this.originalDataSource.filter(u => u.userId !== userId);
        this.snack.open('User deleted successfully', 'OK', { duration: 2000 });
      },
      error: err => {
        console.error('Error deleting user:', err);
        this.snack.open(err.message || 'Failed to delete user. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }

  private deleteSelected() {
    const selected = this.dataSource().filter(u => u.selected);
    if (!selected.length) {
      this.snack.open('No users selected for deletion', 'OK', { duration: 3000 });
      return;
    }

    const ids = selected.map(u => u.userId);

    this.userService.deleteUsersBulk(ids).subscribe({
      next: () => {
        this.dataSource.set(this.dataSource().filter(u => !u.selected));
        this.originalDataSource = this.originalDataSource.filter(u => !ids.includes(u.userId));
        this.snack.open(`${ids.length} user(s) deleted successfully`, 'OK', { duration: 2000 });
      },
      error: err => {
        console.error('Error deleting selected users:', err);
        this.snack.open(err.message || 'Failed to delete selected users. Please try again.', 'OK', { duration: 3000 });
      }
    });
  }

  /** --- Selection Methods --- */
  isAllSelected(): boolean { 
    return this.dataSource().length > 0 && this.dataSource().every(u => u.selected); 
  }
  
  isIndeterminate(): boolean { 
    const selectedCount = this.dataSource().filter(u => u.selected).length; 
    return selectedCount > 0 && selectedCount < this.dataSource().length; 
  }
  
  toggleAllSelection(): void { 
    const allSelected = this.isAllSelected(); 
    this.dataSource().forEach(u => u.selected = !allSelected); 
  }

  toggleRowSelection(user: UserData): void {
    user.selected = !user.selected;
  }
  
  getSelectedCount(): number { 
    return this.dataSource().filter(u => u.selected).length; 
  }
  
  getSelectedUsers(): UserData[] {
  return this.dataSource().filter(u => u.selected);
  }
  getSelectedUser(): UserData | null {
    const selected = this.getSelectedUsers();
    return selected.length === 1 ? selected[0] : null;
  }

  /** --- Export CSV --- */
  exportCSV() {
  const users = this.dataSource(); 
  if (!users.length) { 
    this.snack.open('No data to export', 'OK', { duration: 2000 }); 
    return; 
  }

  const headers = ['ID','Username','Full Name','Email','Phone','Role','Date Created'];
  const csvContent = [
    headers.join(','), 
    ...users.map(u => [
      u.userId,
      u.username,
      u.fullName,
      u.email || '',
      u.phone || '',
      u.role,
      u.dateCreated
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  this.snack.open('CSV exported successfully', 'OK', { duration: 2000 });
  }
}
