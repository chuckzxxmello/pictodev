import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-user-add-dialog',
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
        Add New User
      </h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        <div class="form-grid">
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Username *</mat-label>
            <input matInput formControlName="username" placeholder="e.g., john.doe" required>
            <mat-error *ngIf="form.get('username')?.hasError('required')">Username is required</mat-error>
            <mat-error *ngIf="form.get('username')?.hasError('pattern')">Username can only contain letters, numbers, dots, and underscores</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Full Name *</mat-label>
            <input matInput formControlName="fullName" placeholder="e.g., John Doe" required>
            <mat-error *ngIf="form.get('fullName')?.hasError('required')">Full name is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g., john.doe@example.com">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="e.g., +1234567890">
            <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Please enter a valid phone number</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role *</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="Manager">Manager</mat-option>
              <mat-option value="User">User</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('role')?.hasError('required')">Role is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Password *</mat-label>
            <input matInput 
                   [type]="hidePassword ? 'password' : 'text'" 
                   formControlName="password" 
                   placeholder="Enter password" 
                   required>
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Password must be at least 6 characters long</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Confirm Password *</mat-label>
            <input matInput 
                   [type]="hideConfirmPassword ? 'password' : 'text'" 
                   formControlName="confirmPassword" 
                   placeholder="Confirm password" 
                   required>
            <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">Please confirm your password</mat-error>
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('passwordMismatch')">Passwords do not match</mat-error>
          </mat-form-field>
        </div>

        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()" class="cancel-btn">
            Cancel
          </button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">
            Add User
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
export class UserAddDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserAddDialogComponent>);
  
  form: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor() {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._]+$/)]],
      fullName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[\d\s\-\(\)]+$/)]],
      role: ['User', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    // Remove confirmPassword from the data sent back and ensure proper field names
    const { confirmPassword, ...userData } = this.form.value;
    this.dialogRef.close(userData);
  }

  close(): void { 
    this.dialogRef.close(); 
  }
}