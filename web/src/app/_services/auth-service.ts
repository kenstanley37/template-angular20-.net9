import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private cookieService: CookieService,
    private snackBar: MatSnackBar
  ) {
    this.checkAuthStatus();
  }
private checkAuthStatus(): void {
    this.http.get(`${this.apiBaseUrl}/api/auth/check`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.isLoggedInSubject.next(true);
        this.isAdminSubject.next(response.isAdmin);
      },
      error: () => {
        this.isLoggedInSubject.next(false);
        this.isAdminSubject.next(false);
      }
    });
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiBaseUrl}/api/user/profile`, { withCredentials: true });
  }

  signOut(): void {
    this.http.post(`${this.apiBaseUrl}/api/auth/signout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.isLoggedInSubject.next(false);
        this.isAdminSubject.next(false);
        this.snackBar.open('Signed out successfully.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.snackBar.open('Failed to sign out.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  verifyEmail(token: string): Observable<boolean> {
    return this.http.get(`${this.apiBaseUrl}/api/auth/verify-email?token=${token}`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  isEmailVerified(): Observable<boolean> {
    return this.getUserInfo().pipe(
      switchMap((user) => {
        if (user.emailVerified) {
          return of(true);
        }
        return this.http.post(`${this.apiBaseUrl}/api/auth/resend-verification-email`, {}, { withCredentials: true }).pipe(
          tap(() => this.snackBar.open('Verification email sent.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] })),
          map(() => false)
        );
      }),
      catchError(() => {
        this.snackBar.open('Failed to check email verification.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        return of(false);
      })
    );
  }
}
