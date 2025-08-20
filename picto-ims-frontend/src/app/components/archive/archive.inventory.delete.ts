import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
        Delete Item
      </h2>
      
      <div class="content">
        <p *ngIf="!data.isBulk">Are you sure you want to delete this item?</p>
        <p *ngIf="data.isBulk" style="color:red; font-weight:bold;">
          Warning: You are about to delete {{ data.items.length }} items. This action cannot be undone!
        </p>

        <div *ngIf="!data.isBulk" class="item-details">
          <strong>{{ data?.items[0]?.itemName }}</strong>
          <span class="item-id">ID: {{ data?.items[0]?.itemId }}</span>
          <span class="item-serial" *ngIf="data?.items[0]?.serialNumber">
            Serial: {{ data?.items[0]?.serialNumber }}
          </span>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)" class="cancel-btn">
          Cancel
        </button>
        <button mat-flat-button color="warn" (click)="close(true)" class="delete-btn">
          Delete Item
        </button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 0;
      max-width: 400px;
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
    }
    
    .content {
      padding: 0 0 16px 0;
    }
    
    .item-details {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin: 12px 0;
    }
    
    .item-details strong {
      display: block;
      font-size: 16px;
      margin-bottom: 4px;
    }
    
    .item-id, .item-serial {
      display: block;
      font-size: 12px;
      color: #666;
      margin-bottom: 2px;
    }
    
    .warning-text {
      color: #d32f2f;
      font-weight: 500;
      margin-top: 12px;
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
  `]
})
export class ArchiveInventoryDeleteDialogComponent {
  private dialogRef = inject(MatDialogRef<ArchiveInventoryDeleteDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);

  close(result: boolean): void { 
    this.dialogRef.close(result); 
  }
}