import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.initializeAuth();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private initializeAuth(): void {
    // Only initialize from localStorage if we're in the browser
    if (this.isBrowser()) {
      const token = this.getToken();
      const user = this.getStoredUser();
      
      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_BASE_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setToken(response.token);
            this.setUser(response.user);
            this.currentUserSubject.next(response.user);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
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
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
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

  // Helper method to refresh auth state after browser hydration
  refreshAuthState(): void {
    if (this.isBrowser()) {
      const token = this.getToken();
      const user = this.getStoredUser();
      
      if (token && user) {
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } else {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    }
  }
}