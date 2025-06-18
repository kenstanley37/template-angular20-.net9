import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import {
  RegisterDto,
  LoginDto,
  ProfileDto,
  UpdateProfilePictureDto,
  SocialLoginDto
} from '../_models/user-model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  // Signals for reactive state
  readonly isAuthenticated = signal(false);
  readonly userProfile = signal<ProfileDto | null>(null);

  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, dto, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  login(dto: LoginDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, dto, { withCredentials: true }).pipe(
      tap(() => this.isAuthenticated.set(true)),
      catchError(this.handleError)
    );
  }

  socialLogin(endpoint: string, dto: SocialLoginDto): Observable<any> {
    return this.http.post<ProfileDto>(`${environment.apiUrl}/auth/${endpoint}`, dto, { withCredentials: true }).pipe(
      tap(() => this.isAuthenticated.set(true)),
      catchError(this.handleError)
    );
  }

  getProfile(): Observable<any> {
    if(this.userProfile()) {
      return of(this.userProfile());
    }

    return this.http.get<ProfileDto>(`${environment.apiUrl}/auth/profile`, { withCredentials: true }).pipe(
      tap(profile => this.userProfile.set(profile)),
      catchError((error: HttpErrorResponse) => {
        this.userProfile.set(null);
        return this.handleError(error);
      })
    );
  }

  updateProfilePicture(dto: UpdateProfilePictureDto): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/profile/picture`, dto, { withCredentials: true })
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.isAuthenticated.set(false)),
      catchError(this.handleError)
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        this.isAuthenticated.set(true);
        this.getProfile(); // Side effect: re-fetch profile
        console.log('Token refreshed successfully:', response);
      }),
      catchError(error => {
        this.isAuthenticated.set(false);
        return this.handleError(error);
      })
    );
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getUserProfile(): ProfileDto | null {
    return this.userProfile();
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<{ isAuthenticated: boolean }>(`${environment.apiUrl}/auth/check`, { withCredentials: true }).pipe(
      map(response => {
        //console.log('Auth status:', response.isAuthenticated);
        this.isAuthenticated.set(response.isAuthenticated);
        return response.isAuthenticated;
      }),
      catchError(() => {
        this.isAuthenticated.set(false);
        return of(false);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again later.';
    if (error.status === 0) {
      errorMessage = `Unable to connect to the backend at ${environment.apiUrl}. Please check your connection.`;
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = error.error || errorMessage;
    }
    console.error('AuthService error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
