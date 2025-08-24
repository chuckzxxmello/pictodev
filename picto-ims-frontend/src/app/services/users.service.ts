import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserData {
  userId: string;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
  dateCreated: string | Date;
  selected?: boolean;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  username?: string;
  password?: string;
  fullName?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface UserResponseDto {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
  dateCreated: string;
}

export interface BulkDeleteRequest {
  userIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  getAllUsers(): Observable<UserData[]> {
    return this.http.get<UserResponseDto[]>(this.apiUrl).pipe(
      map(users => users.map(user => ({
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateCreated: user.dateCreated,
        selected: false
      }))),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<UserData> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/${id}`).pipe(
      map(user => ({
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateCreated: user.dateCreated
      })),
      catchError(this.handleError)
    );
  }

  getUserByUsername(username: string): Observable<UserData> {
    return this.http.get<UserResponseDto>(`${this.apiUrl}/username/${username}`).pipe(
      map(user => ({
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateCreated: user.dateCreated
      })),
      catchError(this.handleError)
    );
  }

  createUser(createUserRequest: CreateUserRequest): Observable<UserData> {
    return this.http.post<UserResponseDto>(this.apiUrl, createUserRequest, this.httpOptions).pipe(
      map(user => ({
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateCreated: user.dateCreated
      })),
      catchError(this.handleError)
    );
  }

  updateUser(id: string, updateUserRequest: UpdateUserRequest): Observable<UserData> {
    return this.http.put<UserResponseDto>(`${this.apiUrl}/${id}`, updateUserRequest, this.httpOptions).pipe(
      map(user => ({
        userId: user.userId.toString(),
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        dateCreated: user.dateCreated
      })),
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  deleteUsersBulk(userIds: string[]): Observable<void> {
    const request: BulkDeleteRequest = { userIds };
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, request, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 400) {
        errorMessage = error.error || 'Bad request';
      } else if (error.status === 404) {
        errorMessage = 'User not found';
      } else if (error.status === 409) {
        errorMessage = error.error || 'User already exists';
      } else if (error.status === 500) {
        errorMessage = 'Internal server error';
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('UserService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}