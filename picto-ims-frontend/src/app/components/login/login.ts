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
  <body>
    <div class="login-page">
      <div class="login-container">
        <div class="login-card"
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
          <div class="logo-placeholder">LOGO</div>

          <h2 class="system-title">PICTO Inventory Management System</h2>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="login-form">
            <input 
              id="username"
              type="text"
              placeholder="username"
              formControlName="username"
              required
              [class.error]="loginForm.get('username')?.invalid && loginForm.get('username')?.touched">

            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="field-error">
              Username is required
            </div>

            <input 
              id="password"
              type="password"
              placeholder="password"
              formControlName="password"
              required
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">

            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="field-error">
              Password is required
            </div>

            <button 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading"
              class="login-button">
              {{ isLoading ? 'Signing in...' : 'Log in' }}
            </button>
          </form>
        </div>
      </div>
      <div class="footer">
        <div class="footer-text">
          PARA SA BAYAN, MULA SA BAYAN
        </div>
        <img src="assets/images/pgc-logo.png" alt="Logo" class="footer-logo">
      </div>
    </div>
  </body>
`,
styles: [`
  @font-face {
    font-family: 'Montserrat';
    src: url('/assets/fonts/Montserrat.ttf') format('truetype');
  }

  body {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Montserrat';
  }

  .login-page {
    display: flex;
    justify-content: center; /* centers horizontally */
    align-items: center;     /* centers vertically */
    min-height: 100vh;       /* full height of screen */
    background: url('/assets/images/bg.png') no-repeat center center fixed;
    background-size: cover;
    position: relative;
  }

  .login-card {
    z-index: 1;
    background: white;
    border-radius: 12px;
    padding: 40px 30px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 360px;
    text-align: center;
  }

  .logo-placeholder {
    width: 70px;
    height: 70px;
    background: black;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    font-weight: bold;
  }

  .system-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 25px;
    color: #3b3636;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .login-form input {
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.3s;
  }

  .login-form input:focus {
    border-color: #253c90;
    outline: none;
  }

  .login-form input.error {
    border-color: #e53e3e;
  }

  .field-error {
    color: #e53e3e;
    font-size: 13px;
    text-align: left;
  }

  .login-button {
    background: #253c90;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s, transform 0.2s;
  }

  .login-button:hover:not(:disabled) {
    background: #1d2f6e;
    transform: translateY(-1px);
  }

  .login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .footer {
    position: fixed; 
    bottom: 0; 
    left: 0; 
    width: 100%; 
    text-align: center; 
    padding: 10px; 
    padding-bottom: 20px;
    background: transparent;
  }
  
  .footer-text {
    margin: 0;
    color: #ffffff;
    font-size: 34px;
    font-weight: 800; 
  }

  .footer-logo {
    position: absolute;
    right: 50px;  /* distance from right edge */
    top: 40%;
    transform: translateY(-50%); /* perfectly center vertically */
    height: 70px; /* adjust size */
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