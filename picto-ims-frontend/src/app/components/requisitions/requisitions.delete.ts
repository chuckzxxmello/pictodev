import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RequisitionForm } from '../../services/requisitions.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-requisition-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog">
      <h2 mat-dialog-title class="dialog-title">Archive Requisition</h2>

      <div class="content">
        <ng-container *ngIf="!data.isBulk; else bulkTpl">
          <p>Are you sure you want to archive this requisition?</p>
          <div class="item-details">
            <div><strong>RS Number:</strong> {{ data.items[0].rsNumber || 'N/A' }}</div>
            <div><strong>Requester:</strong> {{ data.items[0].requesterName }}</div>
            <div><strong>Purpose:</strong> {{ data.items[0].purpose }}</div>
            <div><strong>Department:</strong> {{ data.items[0].department }}</div>
          </div>
        </ng-container>

        <ng-template #bulkTpl>
          <p style="color:red; font-weight:bold;">
            Warning: You are about to archive {{ data.items.length }} requisitions. This action moves them from the active list.
          </p>
        </ng-template>

        <div class="user-info">
          <span class="user-text">
            Action will be recorded as: <strong>{{ currentUser?.username || 'Unknown User' }}</strong>
          </span>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)">Cancel</button>
        <button mat-flat-button color="warn" (click)="close(true)">Archive</button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog { padding: 0; max-width: 480px; }
    .dialog-title { margin-bottom: 16px; color: #d32f2f; }
    .content { padding: 0 0 16px 0; }
    .item-details { background: #f5f5f5; padding: 12px; border-radius: 8px; margin: 12px 0; display: grid; gap: 6px; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #e0e0e0; }
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
    .user-text {
      font-size: 0.875rem;
      color: #1565c0;
    }
    
    .user-text strong {
      color: #0d47a1;
    }
  `]
})
export class RequisitionDeleteDialogComponent {
  private dialogRef = inject(MatDialogRef<RequisitionDeleteDialogComponent>);
  public data: { items: RequisitionForm[]; isBulk: boolean } = inject(MAT_DIALOG_DATA);
  private authService = inject(AuthService);
  currentUser = this.authService.getCurrentUser();

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
