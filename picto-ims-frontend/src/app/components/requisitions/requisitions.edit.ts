import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RequisitionForm } from '../../services/requisitions.service';

@Component({
  selector: 'app-requisition-edit-dialog',
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
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Edit Requisition</h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        
        <div class="section-header">Identifiers</div>
        <div class="form-grid">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>RS Number</mat-label>
              <input matInput formControlName="rsNumber">
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>RF Number</mat-label>
              <input matInput formControlName="rfNumber">
            </mat-form-field>
        </div>

        <div class="section-header">Requester Information</div>
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Requester Name *</mat-label>
            <input matInput formControlName="requesterName" required>
            <mat-error *ngIf="form.get('requesterName')?.hasError('required')">Requester name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Requester Position *</mat-label>
            <input matInput formControlName="requesterPosition" required>
            <mat-error *ngIf="form.get('requesterPosition')?.hasError('required')">Requester position is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Department *</mat-label>
            <input matInput formControlName="department" required>
            <mat-error *ngIf="form.get('department')?.hasError('required')">Department is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Date Requested</mat-label>
            <input matInput type="date" formControlName="dateRequested">
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Purpose *</mat-label>
            <textarea matInput formControlName="purpose" required></textarea>
            <mat-error *ngIf="form.get('purpose')?.hasError('required')">Purpose is required</mat-error>
          </mat-form-field>
        </div>

        <div class="section-header">Workflow & Status</div>
        <div class="form-grid">
            <mat-form-field appearance="outline" class="form-field full-width">
                <mat-label>Workflow Status</mat-label>
                <mat-select formControlName="workflowStatus">
                    <mat-option value="Pending">Pending</mat-option>
                    <mat-option value="Checked">Checked</mat-option>
                    <mat-option value="Approved">Approved</mat-option>
                    <mat-option value="Issued">Issued</mat-option>
                    <mat-option value="Completed">Completed</mat-option>
                </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field"><mat-label>Checked By Name</mat-label><input matInput formControlName="checkedByName"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field"><mat-label>Checked By Position</mat-label><input matInput formControlName="checkedByPosition"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field full-width"><mat-label>Date Checked</mat-label><input matInput type="date" formControlName="checkedByDate"></mat-form-field>
            
            <mat-form-field appearance="outline" class="form-field"><mat-label>Approved By Name</mat-label><input matInput formControlName="approvedByName"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field"><mat-label>Approved By Position</mat-label><input matInput formControlName="approvedByPosition"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field full-width"><mat-label>Date Approved</mat-label><input matInput type="date" formControlName="approvedByDate"></mat-form-field>

            <mat-form-field appearance="outline" class="form-field"><mat-label>Issued By Name</mat-label><input matInput formControlName="issuedByName"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field"><mat-label>Issued By Position</mat-label><input matInput formControlName="issuedByPosition"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field full-width"><mat-label>Date Issued</mat-label><input matInput type="date" formControlName="issuedByDate"></mat-form-field>

            <mat-form-field appearance="outline" class="form-field"><mat-label>Received By Name</mat-label><input matInput formControlName="receivedByName"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field"><mat-label>Received By Position</mat-label><input matInput formControlName="receivedByPosition"></mat-form-field>
            <mat-form-field appearance="outline" class="form-field full-width"><mat-label>Date Received</mat-label><input matInput type="date" formControlName="receivedByDate"></mat-form-field>
        </div>
        
        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || form.pristine">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 24px; }
    .dialog-title { margin-bottom: 16px; color: #1976d2; }
    .dialog-form { max-height: 70vh; overflow-y: auto; padding-right: 10px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .form-field.full-width { grid-column: 1 / -1; }
    .section-header { font-weight: 500; color: #3f51b5; margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
    .dialog-actions { display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class RequisitionEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RequisitionEditDialogComponent>);
  public data: { item: RequisitionForm } = inject(MAT_DIALOG_DATA);

  form = this.fb.group({
    rsNumber: [''],
    rfNumber: [''],
    requesterName: ['', Validators.required],
    requesterPosition: ['', Validators.required],
    department: ['', Validators.required],
    purpose: ['', Validators.required],
    dateRequested: [''],
    workflowStatus: [''],
    checkedByName: [''],
    checkedByPosition: [''],
    checkedByDate: [''],
    approvedByName: [''],
    approvedByPosition: [''],
    approvedByDate: [''],
    issuedByName: [''],
    issuedByPosition: [''],
    issuedByDate: [''],
    receivedByName: [''],
    receivedByPosition: [''],
    receivedByDate: [''],
  });

  ngOnInit(): void {
    if (this.data?.item) {
      const item = this.data.item;
      // Helper to format dates for HTML date inputs ('yyyy-MM-dd')
      const formatDate = (date: string | undefined) => date ? new Date(date).toISOString().substring(0, 10) : '';
      
      this.form.patchValue({
        ...item,
        dateRequested: formatDate(item.dateRequested),
        checkedByDate: formatDate(item.checkedByDate),
        approvedByDate: formatDate(item.approvedByDate),
        issuedByDate: formatDate(item.issuedByDate),
        receivedByDate: formatDate(item.receivedByDate),
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.value;
    for (const key in formData) {
        if (key.toLowerCase().includes('date') && formData[key as keyof typeof formData] === '') {
            (formData as any)[key] = null;
        }
    }
    this.dialogRef.close({ ...this.data.item, ...formData });
  }

  close(): void { this.dialogRef.close(); }
}