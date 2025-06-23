import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, effect, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  ProfileDto,
  UpdateProfilePictureDto,
  SocialLoginDto,
  ApiResponse
} from '../_models/user-model';
import { environment } from '../../environments/environment';
import { DeviceIdService } from './device-id-service';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private deviceIdService = inject(DeviceIdService);
  private userService = inject(UserService);
  private baseUrl = `${environment.apiUrl}`;

  // Signals for reactive state
  //private isAuthenticated = signal<boolean>(false);
  private isAuthenticatedSignal = signal<boolean>(false);
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  //public readonly isAuthenticated$ = this.isAuthenticated.asReadonly();
  //public readonly userProfile$: Signal<ProfileDto | null> = this.userProfile.asReadonly();

  constructor() {
    // Initialize authentication state
    this.checkAuthStatus().subscribe({
      next: (isAuthenticated) => {
        this.isAuthenticatedSignal.set(isAuthenticated);
      },
      error: () => this.isAuthenticatedSignal.set(false)
    });
  }


  getIsAuthenticated(): Observable<boolean> {
    return of(this.isAuthenticated());
  }

  // Register a new user
  register(dto: RegisterDto): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/register`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(message => console.log('Registration successful:', message)),
      catchError(this.handleError)
    );
  }

  // Login a user
  login(dto: LoginDto): Observable<ProfileDto> {
    const deviceId = this.deviceIdService.getDeviceId();

    dto.deviceId = deviceId; // Attach device ID to the login request

    return this.http.post<ApiResponse<ProfileDto>>(`${this.baseUrl}/auth/login`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => {
        this.isAuthenticatedSignal.set(true);
        this.userService.setProfile(profile);
      }),
      catchError(this.handleError)
    );
  }

  // Google login
  googleLogin(token: string): Observable<ProfileDto> {
    const deviceId = this.deviceIdService.getDeviceId();
    const dto: SocialLoginDto = { token, stayLoggedIn: true, deviceId }; // Attach device ID to the social login request
  
    // Note: stayLoggedIn is not used in the backend for Google login, but included for consistency
    // If you want to allow users to choose whether to stay logged in, you can modify the method signature to accept it as a parameter.

    return this.http.post<ApiResponse<ProfileDto>>(`${this.baseUrl}/auth/google-login`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => {
        this.userService.setProfile(profile); // Set the user profile in UserService
        this.isAuthenticatedSignal.set(true);
      }),
      catchError(this.handleError)
    );
  }

  // Facebook login
  facebookLogin(token: string, stayLoggedIn: boolean): Observable<void> {
    const deviceId = this.deviceIdService.getDeviceId();
    const dto: SocialLoginDto = { token, stayLoggedIn, deviceId }; // Attach device ID to the social login request
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/facebook-login`, dto, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response); // Validate response
        return; // Return void
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(true);
      }),
      catchError(this.handleError)
    );
  }

  // Verify email
  verifyEmail(token: string): Observable<string> {
    return this.http.get<ApiResponse<string>>(`${this.baseUrl}/auth/verify-email?token=${token}`, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(message => console.log('Email verification successful:', message)),
      catchError(this.handleError)
    );
  }


  setIsAuthenticated(isAuthenticated: boolean): void {
    this.isAuthenticatedSignal.set(isAuthenticated);
  }

  // Logout
  logout(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response); // Validate response
        return; // Return void
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(false);
      }),
      catchError(this.handleError)
    );
  }

  // Refresh token
  refreshToken(): Observable<void> {
    const deviceId = this.deviceIdService.getDeviceId();

    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true, headers: { 'X-Device-Id': deviceId } }).pipe(
      map(response => {
        this.handleResponse(response); // Validate response
        return; // Return void
      }),
      tap(() => this.isAuthenticatedSignal.set(true)),
      catchError(this.handleError)
    );
  }

  // Check authentication status
  checkAuthStatus(): Observable<boolean> {
    return this.http.get<ApiResponse<{ isAuthenticated: boolean }>>(`${this.baseUrl}/auth/check`, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response).isAuthenticated),
      tap(isAuthenticated => this.isAuthenticatedSignal.set(isAuthenticated)),
      catchError(() => {
        this.isAuthenticatedSignal.set(false);
        return of(false);
      })
    );
  }

  // Handle API response
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    // Optionally log the response for debugging
    // console.log('API response:', response);
    return response.data as T;
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';

    if (error.status === 0) {
      errorMessage = `Unable to connect to the backend at ${environment.apiUrl}. Please check your connection.`;
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      errorMessage = error.error.message || `Server error: ${error.statusText}`;
    } else {
      errorMessage = `Server error: ${error.status} ${error.statusText}`;
    }

    console.error('AuthService error:', { status: error.status, message: errorMessage, error });
    return throwError(() => new Error(errorMessage));
  }
}