// src/app/auth/login.component.ts
import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>PICTO Inventory Management System</h1>
        </div>

        <div *ngIf="errorMessage()" class="error-message" role="alert">
          {{ errorMessage() }}
        </div>

        <div *ngIf="successMessage()" class="success-message" role="status">
          {{ successMessage() }}
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="login-form">
          <div class="form-field">
            <input
              id="username"
              type="text"
              formControlName="username"
              placeholder="username"
              autocomplete="username"
              [attr.aria-invalid]="loginForm.controls.username.invalid && loginForm.controls.username.touched"
              [class.error]="loginForm.controls.username.invalid && loginForm.controls.username.touched" />
            <div *ngIf="loginForm.controls.username.invalid && loginForm.controls.username.touched" class="field-error">
              Username is required.
            </div>
          </div>

          <div class="form-field">
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="password"
              autocomplete="current-password"
              [attr.aria-invalid]="loginForm.controls.password.invalid && loginForm.controls.password.touched"
              [class.error]="loginForm.controls.password.invalid && loginForm.controls.password.touched" />
            <div *ngIf="loginForm.controls.password.invalid && loginForm.controls.password.touched" class="field-error">
              Password is required.
            </div>
          </div>

          <button
            type="submit"
            class="login-button"
            [disabled]="loginForm.invalid || isLoading()"
            [attr.aria-busy]="isLoading()">
            {{ isLoading() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="debug-info" *ngIf="showDebugInfo">
          <p><strong>Debug Info:</strong></p>
          <p>Current URL: {{ currentUrl() }}</p>
          <p>Return URL: {{ returnUrl() || 'None' }}</p>
          <p>Auth Status: {{ authStatus() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
  .login-container {
    display: grid;
    place-items: center;
    width: 100vw;
    height: 100svh;                 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;               
  }

  .login-card {
    background: #fff;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,.2);
    width: min(400px, 92vw);
  }

  .login-header { text-align: center; margin-bottom: 30px; }
  .login-header h1 { color:#333; margin-bottom: 8px; font-size: 1.5rem; }
  .login-header h3 { color:#666; margin:0; font-size: 1rem; font-weight: 400; }

  .error-message { background:#fee; color:#c33; padding:12px; border-radius:6px; margin-bottom:20px; border:1px solid #fcc; }
  .success-message { background:#efe; color:#363; padding:12px; border-radius:6px; margin-bottom:20px; border:1px solid #cfc; }

  .login-form { display:flex; flex-direction:column; gap: 18px; }
  .form-field { display:flex; flex-direction:column; gap:6px; }
  .form-field label { font-weight:600; color:#333; }
  .form-field input {
    padding:12px; border:2px solid #ddd; border-radius:6px; font-size:16px;
    transition: border-color .2s, box-shadow .2s;
  }
  .form-field input:focus { outline:none; border-color:#667eea; box-shadow:0 0 0 3px rgba(102,126,234,.15); }
  .form-field input.error { border-color:#e53e3e; }
  .field-error { color:#e53e3e; font-size:13px; }

  .forgot { margin-top:-6px; font-size:13px; color:#666; text-decoration:none; }
  .forgot:hover { text-decoration: underline; }

  .login-button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color:#fff; border:none; padding:12px 24px; border-radius:6px;
    font-size:16px; font-weight:600; cursor:pointer; transition: transform .12s;
  }
  .login-button:hover:not(:disabled) { transform: translateY(-1px); }
  .login-button:disabled { opacity:.65; cursor:not-allowed; }

  .debug-info { margin-top:20px; padding:12px; background:#f5f5f5; border-radius:6px; font-size:12px; color:#666; }
`]

})
export class Login implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Reactive form (strongly typed)
  readonly loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  // UI state as signals
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly currentUrl = signal('');
  readonly returnUrl = signal<string | null>(null);
  readonly authStatus = signal<'checking...' | 'authenticated' | 'not authenticated'>('checking...');
  showDebugInfo = false; // toggle for debugging

  async ngOnInit(): Promise<void> {
    // If your AuthService needs async init
    if (this.authService.waitForInitialization) {
      await this.authService.waitForInitialization();
    }

    // Read returnUrl from ?returnUrl=...
    this.returnUrl.set(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard');

    // Already logged in?
    if (this.authService.isLoggedIn?.() || this.authService.isAuthenticated?.()) {
      this.authStatus.set('authenticated');
      this.router.navigate([this.returnUrl()!]);
      return;
    } else {
      this.authStatus.set('not authenticated');
    }

    // Track URL changes
    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(e => this.currentUrl.set(e.urlAfterRedirects));

    // React to auth state changes
    if (this.authService.isAuthenticated$) {
      this.authService.isAuthenticated$
        .pipe(takeUntilDestroyed())
        .subscribe(isAuth => {
          this.authStatus.set(isAuth ? 'authenticated' : 'not authenticated');
          if (isAuth) this.router.navigate([this.returnUrl()!]);
        });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Login successful! Redirecting…');
          setTimeout(() => this.router.navigate([this.returnUrl()!]), 500);
        },
        error: (err) => {
          // Normalize common cases
          const msg =
            err?.status === 0
              ? 'Cannot reach the server. Make sure the API is running and CORS allows this origin.'
              : err?.error?.message || err?.message || 'Login failed. Please check your credentials and try again.';
          this.errorMessage.set(msg);
          console.error('Login error:', err);
        }
      });
  }
}
