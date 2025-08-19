import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { catchError, retry, throwError, timeout, timer } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Add auth token if available
  const authToken = authService.getToken();
  let authReq = req;

  if (authToken) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
  }

  // Add common headers
  const apiReq = authReq.clone({
    headers: authReq.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
  });

  return next(apiReq).pipe(
    timeout(environment.apiTimeout),
    retry({
      count: 2,
      delay: (error, retryCount) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status >= 500 || error.status === 0) {
            return timer(retryCount * 1000);
          }
        }
        return throwError(() => error);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (environment.enableLogging) {
        console.error('API Error:', error);
      }
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};