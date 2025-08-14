import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>PICTO Inventory Management System</h1>
          <h3>Provincial Government Capitol of Cavite</h3>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="login-form">
          <div class="form-field">
            <label for="username">Username:</label>
            <input 
              id="username"
              type="text" 
              formControlName="username" 
              required
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="field-error">
              Username is required
            </div>
          </div>

          <div class="form-field">
            <label for="password">Password:</label>
            <input 
              id="password"
              type="password" 
              formControlName="password" 
              required
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="field-error">
              Password is required
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading"
            class="login-button">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="debug-info" *ngIf="showDebugInfo">
          <p><strong>Debug Info:</strong></p>
          <p>Current URL: {{ currentUrl }}</p>
          <p>Return URL: {{ returnUrl || 'None' }}</p>
          <p>Auth Status: {{ authStatus }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h1 {
      color: #333;
      margin-bottom: 8px;
      font-size: 1.5rem;
    }

    .login-header h3 {
      color: #666;
      margin: 0;
      font-size: 1rem;
      font-weight: normal;
    }

    .error-message {
      background: #fee;
      color: #c33;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      border: 1px solid #fcc;
    }

    .success-message {
      background: #efe;
      color: #363;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
      border: 1px solid #cfc;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-field label {
      font-weight: 600;
      color: #333;
    }

    .form-field input {
      padding: 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.3s;
    }

    .form-field input:focus {
      outline: none;
      border-color: #667eea;
    }

    .form-field input.error {
      border-color: #e53e3e;
    }

    .field-error {
      color: #e53e3e;
      font-size: 14px;
    }

    .login-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .login-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .debug-info {
      margin-top: 20px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      font-size: 12px;
      color: #666;
    }
  `]
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentUrl = '';
  returnUrl: string | null = null;
  authStatus = 'checking...';
  showDebugInfo = false; // Set to true for debugging

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    // Wait for auth service initialization
    await this.authService.waitForInitialization();

    // Get return URL from query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      console.log('User already logged in, redirecting to:', this.returnUrl);
      this.router.navigate([this.returnUrl]);
      return;
    }

    this.authStatus = this.authService.isAuthenticated() ? 'authenticated' : 'not authenticated';

    this.currentUrl = this.router.url;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
    });

    // Subscribe to auth changes
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.authStatus = isAuth ? 'authenticated' : 'not authenticated';
      if (isAuth) {
        // User got authenticated, redirect
        this.router.navigate([this.returnUrl]);
      }
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
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Login successful! Redirecting...';
        
        // Navigate to return URL or dashboard
        setTimeout(() => {
          this.router.navigate([this.returnUrl]);
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error?.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error?.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Login failed. Please check your credentials and try again.';
        }
      }
    });
  }
}