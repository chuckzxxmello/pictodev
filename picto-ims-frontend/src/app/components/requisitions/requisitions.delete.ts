import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Requisition } from '../../models';

@Component({
  selector: 'app-requisition-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-dialog">
      <h2 mat-dialog-title class="dialog-title">Delete Requisition</h2>

      <div class="content">
        <ng-container *ngIf="!data.isBulk; else bulkTpl">
          <p>Are you sure you want to delete this requisition?</p>
          <div class="item-details">
            <div><strong>RFID:</strong> {{ data.items[0]?.rfId }}</div>
            <div><strong>Requester:</strong> {{ data.items[0]?.requesterName }}</div>
            <div><strong>Purpose:</strong> {{ data.items[0]?.purpose }}</div>
            <div><strong>Department:</strong> {{ data.items[0]?.department }}</div>
          </div>
        </ng-container>

        <ng-template #bulkTpl>
          <p style="color:red; font-weight:bold;">
            Warning: You are about to delete {{ data.items.length }} requisitions. This action cannot be undone!
          </p>
        </ng-template>
      </div>

      <div class="dialog-actions">
        <button mat-stroked-button (click)="close(false)">Cancel</button>
        <button mat-flat-button color="warn" (click)="close(true)">Delete</button>
      </div>
    </div>
  `,
  styles: [`
    .delete-dialog { padding: 0; max-width: 480px; }
    .dialog-title { margin-bottom: 16px; color: #d32f2f; }
    .content { padding: 0 0 16px 0; }
    .item-details { background: #f5f5f5; padding: 12px; border-radius: 8px; margin: 12px 0; display: grid; gap: 6px; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid #e0e0e0; }
  `]
})
export class RequisitionDeleteDialogComponent {
  private dialogRef = inject(MatDialogRef<RequisitionDeleteDialogComponent>);
  public data: { items: Requisition[]; isBulk: boolean } = inject(MAT_DIALOG_DATA);

  close(result: boolean): void {
    this.dialogRef.close(result); // parent component performs deletion
  }
}