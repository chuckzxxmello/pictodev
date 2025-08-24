import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inventory-delete-dialog',
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
        Delete Item{{ data.isBulk ? 's' : '' }}
      </h2>
      
      <div class="content">
        <div class="warning-message">
          <p *ngIf="!data.isBulk">Are you sure you want to delete this item?</p>
          <p *ngIf="data.isBulk" class="bulk-warning">
            <strong>Warning:</strong> You are about to delete <strong>{{ data.items.length }}</strong> items. 
            This action will move them to the archive.
          </p>
        </div>

        <div *ngIf="!data.isBulk" class="item-details">
          <div class="item-info">
            <strong>{{ data?.items[0]?.itemName }}</strong>
            <div class="item-meta">
              <span class="item-id">ID: {{ data?.items[0]?.itemId }}</span>
              <span class="item-serial" *ngIf="data?.items[0]?.serialNumber">
                Serial: {{ data?.items[0]?.serialNumber }}
              </span>
            </div>
          </div>
        </div>

        <div *ngIf="data.isBulk" class="bulk-items">
          <div class="bulk-summary">
            <strong>Items to be deleted:</strong>
          </div>
          <div class="items-list">
            <div *ngFor="let item of data.items; let i = index" class="bulk-item">
              <span class="item-number">{{ i + 1 }}.</span>
              <span class="item-name">{{ item.itemName }}</span>
              <span class="item-id">(ID: {{ item.itemId }})</span>
            </div>
          </div>
        </div>

        <div class="user-info">
          <span class="user-text">
            Action will be recorded as: <strong>{{ currentUser?.username || 'Unknown User' }}</strong>
          </span>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)" class="cancel-btn">
          Cancel
        </button>
        <button mat-flat-button color="warn" (click)="close(true)" class="delete-btn">
          {{ data.isBulk ? 'Delete All Items' : 'Delete Item' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog { 
      padding: 0; 
      max-width: 520px; 
      min-width: 400px;
    }
    
    .dialog-title { 
      margin-bottom: 16px; 
      color: #d32f2f; 
      display: flex; 
      align-items: center; 
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    .warning-icon {
      color: #ff9800;
      font-size: 24px;
    }
    
    .content { 
      padding: 0 0 16px 0; 
    }
    
    .warning-message {
      margin-bottom: 16px;
    }
    
    .warning-message p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    
    .bulk-warning {
      color: #d32f2f !important;
      font-weight: 500 !important;
    }
    
    .item-details { 
      background: #f8f9fa; 
      padding: 16px; 
      border-radius: 8px; 
      margin: 12px 0; 
      border-left: 4px solid #d32f2f;
    }
    
    .item-info strong {
      display: block;
      color: #333;
      font-size: 1rem;
      margin-bottom: 8px;
    }
    
    .item-meta {
      display: flex;
      gap: 16px;
      font-size: 0.875rem;
      color: #666;
    }
    
    .bulk-items {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin: 12px 0;
      border-left: 4px solid #d32f2f;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .bulk-summary {
      margin-bottom: 12px;
      color: #333;
      font-weight: 500;
    }
    
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .bulk-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 0.875rem;
    }
    
    .item-number {
      color: #666;
      min-width: 20px;
    }
    
    .item-name {
      color: #333;
      font-weight: 500;
      flex: 1;
    }
    
    .item-id {
      color: #666;
      font-size: 0.8rem;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #e3f2fd;
      border-radius: 6px;
      margin: 16px 0 8px 0;
      border: 1px solid #bbdefb;
    }
    
    .user-icon {
      color: #1976d2;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .user-text {
      font-size: 0.875rem;
      color: #1565c0;
    }
    
    .user-text strong {
      color: #0d47a1;
    }
    
    .dialog-actions { 
      display: flex; 
      gap: 12px; 
      justify-content: flex-end; 
      padding-top: 16px; 
      border-top: 1px solid #e0e0e0; 
    }
    
    .cancel-btn, .delete-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 100px;
      height: 40px;
    }
    
    .cancel-btn {
      border-color: #666;
      color: #666;
    }
    
    .cancel-btn:hover {
      background-color: #f5f5f5;
      border-color: #333;
      color: #333;
    }
    
    .delete-btn {
      background-color: #d32f2f;
      color: white;
    }
    
    .delete-btn:hover {
      background-color: #b71c1c;
    }
    
    .delete-btn mat-icon {
      color: white;
    }
    
    /* Scrollbar styling for bulk items */
    .items-list::-webkit-scrollbar {
      width: 6px;
    }
    
    .items-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }
    
    .items-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
    
    .items-list::-webkit-scrollbar-thumb:hover {
      background: #a1a1a1;
    }
  `]
})
export class InventoryDeleteDialogComponent {
  private dialogRef = inject(MatDialogRef<InventoryDeleteDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);
  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  close(result: boolean): void { 
    this.dialogRef.close(result); 
  }
}