import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">Add Requisition</h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
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

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Purpose *</mat-label>
            <textarea matInput formControlName="purpose" required cdkTextareaAutosize #autosize="cdkTextareaAutosize" cdkAutosizeMinRows="2"></textarea>
            <mat-error *ngIf="form.get('purpose')?.hasError('required')">Purpose is required</mat-error>
          </mat-form-field>
          
        </div>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Add Requisition</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 24px;
      max-width: 500px;
      border-radius: 12px;
      background-color: #fcfcfc;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 100px;
      margin-bottom: 24px;
      color: #333; /* Darker, more professional color */
      font-weight: 600;
      font-size: 1.5rem;
      border-bottom: 1px solid #eee; /* Add a subtle divider */
      padding-bottom: 16px;
    }

    
    .title-icon {
      font-size: 24px;
      text-align: center;
    }
    
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .form-field.full-width {
      grid-column: 1 / -1;
    }
    
    ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 10px !important; /* Adjust this value for more or less rounding */
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-flex {
      border-radius: 10px !important; /* Applies to the inner flex container */
    }

    /* Also apply to the mat-select field */
    ::ng-deep .mat-mdc-select-trigger {
      border-radius: 10px !important;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 24px;
    }

    .cancel-btn {
      color: #6c757d;
      border-color: #dee2e6;
    }

    .submit-btn {
      /* This is already handled by Material, but you could add a custom shadow */
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: box-shadow 0.3s ease-in-out;
      color: #ffffff;
      background-color: #253c90;
    }
    .submit-btn:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    ::ng-deep .category-select .mat-mdc-select-panel {
      background-color: #f0f0f0;
    }
    
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class RequisitionAddDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RequisitionAddDialogComponent>);

  form = this.fb.group({
    requesterName: ['', Validators.required],
    requesterPosition: ['', Validators.required],
    department: ['', Validators.required],
    purpose: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}