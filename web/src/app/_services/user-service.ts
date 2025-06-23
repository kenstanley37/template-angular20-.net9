import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { ApiResponse, ProfileDto, UpdateProfilePictureDto } from '../_models/user-model';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;

  private userProfileSignal = signal<ProfileDto | null>(null);
  userProfile = this.userProfileSignal.asReadonly();

  private readonly localProfile = 'userProfile';

  constructor() {
    // Effect to persist profile changes or clear on logout
    effect(() => {
      const profile = this.userProfile();
      if (profile) {
        localStorage.setItem(this.localProfile, JSON.stringify(profile));
      } else {
        localStorage.removeItem(this.localProfile);
      }
    });
   }
   //#region Profile Management
   // Get user profile
    getProfile(): Observable<ProfileDto> {
      return this.http.get<ApiResponse<ProfileDto>>(`${this.baseUrl}/user/profile`, { withCredentials: true }).pipe(
        map(response => this.handleResponse(response)),
        tap(profile => this.setProfile(profile)),
        catchError(this.handleError)
      );
    }

    removeProfile(): void {
      this.userProfileSignal.set(null);
    }

    setProfile(profile: ProfileDto | null): void {
      // Set the profile in local storage
      localStorage.setItem(this.localProfile, JSON.stringify(profile));
      // Update the signal with the new profile
      this.userProfileSignal.set(profile);
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

  // Load profile from API or local storage
  private loadProfile(): void {
    const storedProfile = localStorage.getItem(this.localProfile);
    if (storedProfile) {
      try {
        this.userProfileSignal.set(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse stored profile:', e);
      }
    } else {
      this.getProfile().subscribe({
        next: (profile) => this.setProfile(profile),
        error: (err) => console.error('Failed to load profile:', err.message)
      });
    }
  }

    //#endregion

    // Handle API response
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
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
