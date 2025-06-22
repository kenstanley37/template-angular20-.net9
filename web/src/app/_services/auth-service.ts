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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  // Signals for reactive state
  //private isAuthenticated = signal<boolean>(false);
  private isAuthenticatedSignal = signal<boolean>(false);
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  
  private userProfileSignal = signal<ProfileDto | null>(null);
  userProfile = this.userProfileSignal.asReadonly();

  //public readonly isAuthenticated$ = this.isAuthenticated.asReadonly();
  //public readonly userProfile$: Signal<ProfileDto | null> = this.userProfile.asReadonly();

  constructor() {
    // Effect to persist profile changes or clear on logout
    effect(() => {
      const profile = this.userProfile();
      if (profile) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } else {
        localStorage.removeItem('userProfile');
      }
    });

    // Initialize authentication state
    this.checkAuthStatus().subscribe({
      next: (isAuthenticated) => {
        this.isAuthenticatedSignal.set(isAuthenticated);
        if (isAuthenticated) {
          this.loadProfile();
        }
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
  login(dto: LoginDto): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/login`, dto, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response); // Validate response
        return; // Return void
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(true);
        this.loadProfile();
      }),
      catchError(this.handleError)
    );
  }

  // Google login
  googleLogin(token: string): Observable<ProfileDto> {
    const dto: SocialLoginDto = { token };
    return this.http.post<ApiResponse<ProfileDto>>(`${this.baseUrl}/auth/google-login`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => {
        this.isAuthenticatedSignal.set(true);
        this.userProfileSignal.set(profile);
      }),
      catchError(this.handleError)
    );
  }

  // Facebook login
  facebookLogin(token: string, stayLoggedIn: boolean): Observable<void> {
    const dto: SocialLoginDto = { token, stayLoggedIn };
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/facebook-login`, dto, { withCredentials: true }).pipe(
      map(response => {
        this.handleResponse(response); // Validate response
        return; // Return void
      }),
      tap(() => {
        this.isAuthenticatedSignal.set(true);
        this.loadProfile();
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

  setUserProfile(profile: ProfileDto): void {
    this.userProfileSignal.set(profile);
  }

  // Get user profile
  getProfile(): Observable<ProfileDto> {
    const cachedProfile = this.userProfile();
    if (cachedProfile) {
      return of(cachedProfile);
    }

    return this.http.get<ApiResponse<ProfileDto>>(`${this.baseUrl}/user/profile`, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(profile => this.userProfileSignal.set(profile)),
      catchError(this.handleError)
    );
  }

  // Update profile picture
  updateProfilePicture(dto: UpdateProfilePictureDto): Observable<string> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/user/profile/picture`, dto, { withCredentials: true }).pipe(
      map(response => this.handleResponse(response)),
      tap(message => {
        const currentProfile = this.userProfile();
        if (currentProfile) {
          this.userProfileSignal.set({ ...currentProfile, profilePicture: dto.profilePicture || null });
        }
      }),
      catchError(this.handleError)
    );
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
        this.userProfileSignal.set(null);
      }),
      catchError(this.handleError)
    );
  }

  // Refresh token
  refreshToken(): Observable<void> {
    return this.http.post<ApiResponse<null>>(`${this.baseUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
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

  // Getters for signals
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }


  // Load profile from API or local storage
  private loadProfile(): void {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        this.userProfileSignal.set(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse stored profile:', e);
      }
    } else {
      this.getProfile().subscribe({
        error: (err) => console.error('Failed to load profile:', err.message)
      });
    }
  }

  // Handle API response
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    this.getProfile(); // Ensure profile is loaded after any API call
    // Optionally log the response for debugging
    console.log('API response:', response);
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