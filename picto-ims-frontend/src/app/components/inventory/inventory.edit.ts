import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-inventory-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="title-icon">edit</mat-icon>
        Edit Item
      </h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Serial Number</mat-label>
            <input matInput formControlName="serialNumber" placeholder="e.g., SN123456">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Item Name *</mat-label>
            <input matInput formControlName="itemName" placeholder="e.g., HP Laptop" required>
            <mat-error *ngIf="form.get('itemName')?.hasError('required')">Item name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" placeholder="Item description">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Category</mat-label>
            <input matInput formControlName="category" placeholder="e.g., Electronics">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Quantity *</mat-label>
            <input matInput type="number" formControlName="quantity" placeholder="0" min="0" required>
            <mat-error *ngIf="form.get('quantity')?.hasError('required')">Quantity is required</mat-error>
            <mat-error *ngIf="form.get('quantity')?.hasError('min')">Quantity must be 0 or greater</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Unit</mat-label>
            <input matInput formControlName="unit" placeholder="e.g., pcs, kg">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Location</mat-label>
            <input matInput formControlName="location" placeholder="e.g., Warehouse A">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Available">Available</mat-option>
              <mat-option value="Unavailable">Unavailable</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()" class="cancel-btn">
            <mat-icon>close</mat-icon>
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">
            <mat-icon>save</mat-icon>
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      max-width: 500px;
    }
    
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #1976d2;
    }
    
    .title-icon {
      font-size: 24px;
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
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
    
    .cancel-btn {
      color: #666;
    }
    
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InventoryEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InventoryEditDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);
  
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      itemName: ['', [Validators.required]],
      serialNumber: [''],
      description: [''],
      category: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      unit: [''],
      location: [''],
      status: ['Available'],
      selected: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.item) {
      this.form.patchValue(this.data.item);
    }
  }

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