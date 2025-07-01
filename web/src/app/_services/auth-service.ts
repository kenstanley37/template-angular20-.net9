import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, Signal, effect, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  ProfileDto,
  SocialLoginDto,
  ApiResponse
} from '../_models/user-model';
import { environment } from '../../environments/environment';
import { DeviceIdService } from './device-id-service';
import { Router } from '@angular/router';
import { UserService } from './user-service';

interface AuthCheckResponse {
  isAuthenticated: boolean;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private deviceIdService = inject(DeviceIdService);
  private router = inject(Router);
  private userService = inject(UserService);

  private baseUrl = `${environment.apiUrl}`;

  private isAuthenticatedSignal = signal<boolean>(false);
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    /* Circle DI error
    this.refreshToken().subscribe({
      next: () => this.isAuthenticatedSignal.set(true),
      error: () => {
        this.checkAuthStatus().subscribe({
          next: (isAuthenticated) => this.isAuthenticatedSignal.set(isAuthenticated),
          error: () => this.isAuthenticatedSignal.set(false)
        });
      }
    });
    */
  }

  getIsAuthenticated(): Observable<boolean> {
    return of(this.isAuthenticated());
  }

  register(dto: RegisterDto): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/auth/register`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(message => console.log('Registration successful:', message)),
      catchError(this.handleError)
    );
  }

  login(dto: LoginDto): Observable<ProfileDto> {
    const deviceId = this.deviceIdService.getDeviceId();
    dto.deviceId = deviceId;

    return this.http.post<ApiResponse<ProfileDto>>(`${this.baseUrl}/auth/login`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => {
        this.isAuthenticatedSignal.set(true);
        //this.userService.setProfile(profile);
        this.router.navigate(['/dashboard']);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response);
        return;
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(false);
        //this.userService.removeProfile();
        localStorage.removeItem('userProfile');
        this.router.navigate(['/login']);
      }),
      catchError(this.handleError)
    );
  }

  googleLogin(token: string): Observable<ProfileDto> {
    const deviceId = this.deviceIdService.getDeviceId();
    const dto: SocialLoginDto = { token, stayLoggedIn: true, deviceId };

    return this.http.post<ApiResponse<ProfileDto>>(`${this.baseUrl}/auth/google-login`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => {
        //this.userService.setProfile(profile);
        this.isAuthenticatedSignal.set(true);
      }),
      catchError(this.handleError)
    );
  }

  facebookLogin(token: string, stayLoggedIn: boolean): Observable<void> {
    const deviceId = this.deviceIdService.getDeviceId();
    const dto: SocialLoginDto = { token, stayLoggedIn, deviceId };

    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/facebook-login`, dto, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response);
        return;
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(true);
      }),
      catchError(this.handleError)
    );
  }

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

  refreshToken(): Observable<void> {
    const deviceId = this.deviceIdService.getDeviceId();

    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true, headers: { 'X-Device-Id': deviceId } }).pipe(
      map(response => {
        this.handleResponse(response);
        return;
      }),
      tap(() => this.isAuthenticatedSignal.set(true)),
      catchError(this.handleError)
    );
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http
      .get<ApiResponse<AuthCheckResponse>>(`${this.baseUrl}/auth/check`, {
        withCredentials: true
      })
      .pipe(
        map(res => this.handleResponse(res)),
        tap(({ isAuthenticated, email }) => {
          this.isAuthenticatedSignal.set(isAuthenticated);
          this.userService.getProfile(); // if you track user info
        }),
        map(res => res.isAuthenticated),
        catchError(() => {
          this.isAuthenticatedSignal.set(false);
          return of(false);
        })
      );
  }

  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      console.error('API Error:', response);
      throw new Error(response.message || 'API request failed');
    }
    return response.data as T;
  }

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
