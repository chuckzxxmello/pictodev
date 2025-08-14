import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Server-side rendering: deny access
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    // Check authentication state
    return this.auth.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Store the attempted URL for redirecting after login
          const returnUrl = state.url;
          return this.router.createUrlTree(['/login'], { 
            queryParams: { returnUrl } 
          });
        }
      }),
      catchError(() => {
        // On error, redirect to login
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}