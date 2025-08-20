import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-requisition-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Add Requisition</h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        <div class="form-grid">

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>RFID *</mat-label>
            <input matInput formControlName="rfId" required placeholder="e.g., ASDF-654-GD">
            <mat-error *ngIf="form.get('rfId')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Requester Name *</mat-label>
            <input matInput formControlName="requesterName" required>
            <mat-error *ngIf="form.get('requesterName')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Requester Position *</mat-label>
            <input matInput formControlName="requesterPosition" required>
            <mat-error *ngIf="form.get('requesterPosition')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Department *</mat-label>
            <input matInput formControlName="department" required>
            <mat-error *ngIf="form.get('department')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Purpose *</mat-label>
            <input matInput formControlName="purpose" required>
            <mat-error *ngIf="form.get('purpose')?.hasError('required')">Required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Date Requested</mat-label>
            <input matInput type="date" formControlName="dateRequested">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Checked By</mat-label>
            <input matInput formControlName="checkedByName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Approved By</mat-label>
            <input matInput formControlName="approvedByName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Issued By</mat-label>
            <input matInput formControlName="issuedByName">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Received By</mat-label>
            <input matInput formControlName="receivedByName">
          </mat-form-field>

          <div class="form-field">
            <mat-slide-toggle formControlName="isArchived">Archived</mat-slide-toggle>
          </div>
        </div>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Add</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; max-width: 600px; }
    .dialog-title { margin-bottom: 16px; color: #1976d2; }
    .dialog-form { display: flex; flex-direction: column; gap: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field.full-width { grid-column: 1 / -1; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class RequisitionAddDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RequisitionAddDialogComponent>);

  form = this.fb.group({
    rfId: ['', Validators.required],
    requesterName: ['', Validators.required],
    requesterPosition: ['', Validators.required],
    department: ['', Validators.required],
    purpose: ['', Validators.required],
    dateRequested: [''],
    checkedByName: [''],
    approvedByName: [''],
    issuedByName: [''],
    receivedByName: [''],
    isArchived: [false]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Return only the fields needed by your CreateRequisitionRequest
    this.dialogRef.close(this.form.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}