import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="delete-dialog">
      <h2 mat-dialog-title class="dialog-title">
        Delete User{{ data.isBulk ? 's' : '' }}
      </h2>
      
      <div class="content">
        <p *ngIf="!data.isBulk">Are you sure you want to delete this user?</p>
        <p *ngIf="data.isBulk" class="bulk-warning">
          <strong>Warning:</strong> You are about to delete {{ data.users.length }} user{{ data.users.length > 1 ? 's' : '' }}. This action cannot be undone!
        </p>

        <div *ngIf="!data.isBulk" class="user-details">
          <div class="user-info">
            <strong>{{ data?.users[0]?.fullName }}</strong>
            <span class="user-username">@{{ data?.users[0]?.username }}</span>
            <span class="user-email">{{ data?.users[0]?.email }}</span>
            <span class="user-role">
              <mat-icon class="role-icon">{{getRoleIcon(data?.users[0]?.role)}}</mat-icon>
              {{ data?.users[0]?.role }}
            </span>
          </div>
        </div>

        <div *ngIf="data.isBulk" class="bulk-details">
          <div class="bulk-summary">
            <h4>Users to be deleted:</h4>
            <div class="user-list">
              <div *ngFor="let user of data.users" class="user-item">
                <span class="user-name">{{ user.fullName }}</span>
                <span class="user-info-small">(@{{ user.username }}) - {{ user.role }}</span>
              </div>
            </div>
          </div>
        </div>

        <p class="warning-text">
          This will permanently remove the user{{ data.isBulk ? 's' : '' }} from the system.
        </p>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)" class="cancel-btn">
          Cancel
        </button>
        <button mat-flat-button color="warn" (click)="close(true)" class="delete-btn">
          Delete User{{ data.isBulk ? 's' : '' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 0;
      max-width: 450px;
    }
    
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #d32f2f;
    }
    
    .warning-icon {
      font-size: 24px;
      color: #ff9800;
    }
    
    .content {
      padding: 0 0 16px 0;
    }
    
    .bulk-warning {
      color: #d32f2f;
      font-weight: 500;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      border-left: 4px solid #d32f2f;
    }
    
    .user-details {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
    }
    
    .user-info strong {
      display: block;
      font-size: 18px;
      margin-bottom: 4px;
      color: #333;
    }
    
    .user-username {
      display: block;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .user-email {
      display: block;
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
    }
    
    .user-role {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #1976d2;
      background: #e3f2fd;
      padding: 4px 8px;
      border-radius: 12px;
      width: fit-content;
    }
    
    .role-icon {
      font-size: 14px;
    }
    
    .bulk-details {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin: 16px 0;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .bulk-summary h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 14px;
    }
    
    .user-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .user-item {
      display: flex;
      flex-direction: column;
      padding: 8px;
      background: white;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
    }
    
    .user-name {
      font-weight: 500;
      font-size: 13px;
      color: #333;
    }
    
    .user-info-small {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }
    
    .warning-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #ff9800;
      font-size: 14px;
      margin-top: 16px;
      padding: 12px;
      background: #fff8e1;
      border-radius: 4px;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .cancel-btn {
      color: #666;
    }
    
    .delete-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  `]
})
export class UserDeleteDialogComponent {
  private dialogRef = inject(MatDialogRef<UserDeleteDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Admin': return 'admin_panel_settings';
      case 'Manager': return 'manage_accounts';
      case 'User': return 'person';
      case 'Viewer': return 'visibility';
      default: return 'person';
    }
  }

  close(result: boolean): void { 
    this.dialogRef.close(result); 
  }
}