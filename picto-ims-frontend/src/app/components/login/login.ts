import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div>
      <h1>PICTO Inventory Management System</h1>
      <h3>Provincial Government Capitol of Cavite</h3>

      <div *ngIf="errorMessage" style="color: red;">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" style="color: green;">
        {{ successMessage }}
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
        <label>
          Username:
          <input type="text" formControlName="username" required>
        </label>
        <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" style="color:red;">
          Username is required
        </div>

        <label>
          Password:
          <input type="password" formControlName="password" required>
        </label>
        <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" style="color:red;">
          Password is required
        </div>

        <button type="submit" [disabled]="loginForm.invalid || isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p>Note: Dashboard and other routes are currently under development.</p>
      <p>Current URL: {{ currentUrl }}</p>
    </div>
  `
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.currentUrl = this.router.url;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });

    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Login successful! Dashboard will be available soon.';
        // Uncomment if you want to redirect:
        // this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;

        console.error('Login error:', error);

        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error?.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }
}
