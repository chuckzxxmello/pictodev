import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE_URL = 'http://localhost:5265/api';
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private initializationComplete = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
    this.setupStorageListener();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private initializeAuth(): void {
    if (!this.isBrowser()) {
      this.initializationComplete = true;
      return;
    }

    try {
      const token = this.getToken();
      const user = this.getStoredUser();

      console.log('Auth initialization - Token exists:', !!token, 'User exists:', !!user);

      if (token && user && this.isValidUser(user)) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('User authenticated on initialization:', user);
      } else {
        // Clear invalid data
        this.clearStoredAuth();
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        console.log('No valid auth data found on initialization');
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      this.clearStoredAuth();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }

    this.initializationComplete = true;
  }

  private setupStorageListener(): void {
    if (this.isBrowser()) {
      window.addEventListener('storage', (event) => {
        if (event.key === this.TOKEN_KEY || event.key === this.USER_KEY) {
          console.log('Storage change detected, refreshing auth state');
          this.refreshAuthState();
        }
      });

      // Also listen for tab focus to refresh auth state
      window.addEventListener('focus', () => {
        this.refreshAuthState();
      });
    }
  }

  private isValidUser(user: any): boolean {
    return user && typeof user === 'object' && 
           (user.email || user.username) && 
           user.role;
  }

  private clearStoredAuth(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  isLoggedIn(): boolean {
    if (!this.initializationComplete) {
      // During initialization, check localStorage directly
      return this.isBrowser() && !!this.getToken() && !!this.getStoredUser();
    }
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response.token && response.user) {
            this.setToken(response.token);
            this.setUser(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
            console.log('User logged in successfully:', response.user);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  logout(): void {
    console.log('Logging out user');
    this.clearStoredAuth();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Navigate to login without causing navigation loops
    if (this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private setToken(token: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private setUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  private getStoredUser(): User | null {
    if (this.isBrowser()) {
      try {
        const userStr = localStorage.getItem(this.USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/auth/change-password`, {
      currentPassword,
      newPassword
    });
  }

  getCurrentUserDetails(): Observable<User> {
    return this.http.get<User>(`${this.API_BASE_URL}/auth/me`);
  }

  refreshAuthState(): void {
    if (!this.isBrowser()) return;

    try {
      const token = this.getToken();
      const user = this.getStoredUser();

      console.log('Refreshing auth state - Token:', !!token, 'User:', !!user);

      if (token && user && this.isValidUser(user)) {
        // Only update if state actually changed
        if (!this.isAuthenticatedSubject.value || 
            JSON.stringify(this.currentUserSubject.value) !== JSON.stringify(user)) {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          console.log('Auth state refreshed - user authenticated');
        }
      } else {
        // Only update if state actually changed
        if (this.isAuthenticatedSubject.value) {
          this.clearStoredAuth();
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          console.log('Auth state refreshed - user not authenticated');
        }
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
      this.clearStoredAuth();
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    }
  }

  // Method to wait for initialization to complete
  waitForInitialization(): Promise<void> {
    return new Promise(resolve => {
      if (this.initializationComplete) {
        resolve();
      } else {
        const checkInterval = setInterval(() => {
          if (this.initializationComplete) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 10);
      }
    });
  }
}