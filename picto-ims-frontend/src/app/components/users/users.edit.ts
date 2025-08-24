import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-edit-dialog',
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
    MatCheckboxModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        Edit User
      </h2>

      <form [formGroup]="form" class="dialog-form" (ngSubmit)="submit()">
        <div class="form-grid">
          <!-- Username -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Username *</mat-label>
            <input matInput formControlName="username" placeholder="e.g., john.doe" required>
            <mat-error *ngIf="form.get('username')?.hasError('required')">Username is required</mat-error>
            <mat-error *ngIf="form.get('username')?.hasError('pattern')">Username can only contain letters, numbers, dots, and underscores</mat-error>
          </mat-form-field>

          <!-- Full Name -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Full Name *</mat-label>
            <input matInput formControlName="fullName" placeholder="e.g., John Doe" required>
            <mat-error *ngIf="form.get('fullName')?.hasError('required')">Full name is required</mat-error>
          </mat-form-field>

          <!-- Email -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="e.g., john.doe@example.com">
            <mat-error *ngIf="form.get('email')?.hasError('email')">Please enter a valid email address</mat-error>
          </mat-form-field>

          <!-- Phone -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="e.g., +1234567890">
            <mat-error *ngIf="form.get('phone')?.hasError('pattern')">Please enter a valid phone number</mat-error>
          </mat-form-field>

          <!-- Role -->
          <mat-form-field appearance="outline" class="form-field">
            <mat-label>Role *</mat-label>
            <mat-select formControlName="role" required>
              <mat-option value="Admin">Admin</mat-option>
              <mat-option value="Manager">Manager</mat-option>
              <mat-option value="User">User</mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('role')?.hasError('required')">Role is required</mat-error>
          </mat-form-field>

          <!-- Change password -->
          <div class="form-field full-width">
            <mat-checkbox formControlName="changePassword" class="change-password-checkbox">
              Change Password
            </mat-checkbox>
          </div>

          <!-- New Password -->
          <mat-form-field appearance="outline" class="form-field" *ngIf="form.get('changePassword')?.value">
            <mat-label>New Password *</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Enter new password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('password')?.hasError('required')">Password is required</mat-error>
            <mat-error *ngIf="form.get('password')?.hasError('minlength')">Password must be at least 6 characters long</mat-error>
          </mat-form-field>

          <!-- Confirm New Password -->
          <mat-form-field appearance="outline" class="form-field" *ngIf="form.get('changePassword')?.value">
            <mat-label>Confirm New Password *</mat-label>
            <input matInput [type]="hideConfirmPassword ? 'password' : 'text'" formControlName="confirmPassword" placeholder="Confirm new password">
            <button mat-icon-button matSuffix (click)="hideConfirmPassword = !hideConfirmPassword" type="button">
              <mat-icon>{{hideConfirmPassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="form.get('confirmPassword')?.hasError('required')">Please confirm your password</mat-error>
            <mat-error *ngIf="form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched">Passwords do not match</mat-error>
          </mat-form-field>
        </div>

        <!-- Actions -->
        <div class="dialog-actions">
          <button mat-stroked-button type="button" (click)="close()" class="cancel-btn">Cancel</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid" class="submit-btn">Save Changes</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0; max-width: 500px; }
    .dialog-title { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; color: #1976d2; }
    .title-icon { font-size: 24px; }
    .dialog-form { display: flex; flex-direction: column; gap: 16px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-field.full-width { grid-column: 1 / -1; }
    .change-password-checkbox { margin: 8px 0; }
    .dialog-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
    .cancel-btn { color: #666; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `]
})
export class UserEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<UserEditDialogComponent>);
  public data: any = inject(MAT_DIALOG_DATA);

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
      changePassword: [false],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.data?.user) {
      const user = this.data.user;
      this.form.patchValue({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        changePassword: false
      });
    }
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;

    if (!form.get('changePassword')?.value) return null;

    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    return (password && confirmPassword && password !== confirmPassword)
      ? { passwordMismatch: true }
      : null;
  };

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const userData: any = {
      username: formValue.username,
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role
    };

    if (formValue.changePassword && formValue.password) {
      userData.password = formValue.password;
    }

    this.dialogRef.close(userData);
  }

  close(): void {
    this.dialogRef.close();
  }
}