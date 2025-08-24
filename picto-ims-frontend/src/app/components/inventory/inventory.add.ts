import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-inventory-add-dialog',
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
        Add New Item
      </h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Serial Number</mat-label>
            <input matInput formControlName="serialNumber" placeholder="e.g., SN123456">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Item Name</mat-label>
            <input matInput formControlName="itemName" placeholder="e.g., HP Laptop" required>
            <mat-error *ngIf="form.get('itemName')?.hasError('required')">Item name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field full-width">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" placeholder="Item description">
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Category</mat-label>
            <mat-select formControlName="category">
              <mat-option *ngFor="let category of categories" [value]="category">
                {{ category }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Quantity *</mat-label>
            <input matInput type="number" formControlName="quantity" placeholder="0" min="0" required>
            <mat-error *ngIf="form.get('quantity')?.hasError('required')">Quantity is required</mat-error>
            <mat-error *ngIf="form.get('quantity')?.hasError('min')">Quantity must be 0 or greater</mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Stock Threshold *</mat-label>
            <input matInput type="number" formControlName="stockThreshold" placeholder="10" min="0" required>
            <mat-error *ngIf="form.get('stockThreshold')?.hasError('required')">Threshold is required</mat-error>
            <mat-error *ngIf="form.get('stockThreshold')?.hasError('min')">Threshold must be 0 or greater</mat-error>
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
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">
            Add Item
          </button>
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
      color: #333;
      font-weight: 600;
      font-size: 1.5rem;
      border-bottom: 1px solid #eee;
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
      border-radius: 10px !important;
    }

    ::ng-deep .mat-mdc-form-field .mat-mdc-form-field-flex {
      border-radius: 10px !important;
    }

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
export class InventoryAddDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<InventoryAddDialogComponent>);
  
  form: FormGroup;
  categories = ['Electronics', 'IT Supplies', 'Janitorial', 'Other'];

  constructor() {
    this.form = this.fb.group({
      itemName: ['', [Validators.required]], // Changed from 'name' to 'itemName'
      serialNumber: [''], // Changed from 'serial_no' to 'serialNumber'
      description: [''],
      category: [''],
      quantity: [0, [Validators.required, Validators.min(0)]],
      stockThreshold: [10, [Validators.required, Validators.min(0)]],
      unit: [''],
      location: [''],
      status: ['Available']
    });
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