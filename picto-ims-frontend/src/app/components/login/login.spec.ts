import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginResponse } from '../../models';

const mockLoginResponse: LoginResponse = {
  token: 'abc123',
  user: {
    userId: 1,
    username: 'testuser',
    fullName: 'Test User',
    role: 'admin',
    email: 'testuser@example.com',
    phone: '1234567890',
    dateCreated: '2025-08-12T00:00:00Z'
  }
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the login component', () => {
    expect(component).toBeTruthy();
  });

  it('should mark form invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark form valid when username and password are set', () => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should call authService.login and handle success on submit when form is valid', fakeAsync(() => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });
    authServiceSpy.login.and.returnValue(of(mockLoginResponse));

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
    tick(); // simulate async passage of time

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    expect(component.isLoading).toBeFalse();
    expect(component.successMessage).toBe('Login successful! Dashboard will be available soon.');
    expect(component.errorMessage).toBe('');
  }));

  it('should handle login error and set errorMessage on submit', fakeAsync(() => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });

    // Simulate an HTTP error response with error.message
    const errorResponse = { error: { message: 'Invalid credentials' } };
    authServiceSpy.login.and.returnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Invalid credentials');
  }));

  it('should fallback to default error message if error format is unknown', fakeAsync(() => {
    component.loginForm.setValue({ username: 'user', password: 'pass' });

    // Throw an error without error.message property
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Some error')));

    component.onSubmit();

    expect(component.isLoading).toBeTrue();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toBe('Login failed. Please try again.');
  }));
});