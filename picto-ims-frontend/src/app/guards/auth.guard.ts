import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    // During SSR, always deny access and redirect to login
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    // Check if user is logged in (using your existing method name)
    if (this.auth.isLoggedIn && this.auth.isLoggedIn()) {
      return true;
    }

    // If isLoggedIn doesn't exist, try isAuthenticated
    if (this.auth.isAuthenticated && this.auth.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}