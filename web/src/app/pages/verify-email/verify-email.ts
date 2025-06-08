import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  imports: [
    CommonModule,
    MatCardModule
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmail {
  private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  verificationStatus: string = 'Verifying...';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.checkVerification();
    const token = this.getVerificationToken();
    if (!this.isValidToken(token)) {
      throw new Error('Invalid token');
    }
    this.verifyToken(token);
  }

  checkVerification(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.http.get(`${this.apiBaseUrl}/api/auth/verify-email?token=${token}`).subscribe({
        next: () => {
          this.verificationStatus = 'Email verified successfully!';
          this.snackBar.open('Email verified. You can now log in.', 'Close', { duration: 3000, panelClass: ['success-snack'] });
          setTimeout(() => this.router.navigate(['login'],), 3000);
        },
        error: (error) => {
          this.verificationStatus = 'Verification failed!';
          this.snackBar.open(error.error || 'Invalid or expired token.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
        }
      });
    } else {
      this.verificationStatus = 'error';
      throw new Error('No verification token provided');
    }
  }

  getVerificationToken(): string {
    return this.route.snapshot.queryParamMap.get('token')!;
  }

  isValidToken(token: string): boolean {
    return token !== null;
  }

  verifyToken(token: string): void {
    this.http.get(`${this.apiBaseUrl}/api/auth/verify-email?token=${token}&token=${token}`).subscribe({
      next: () => {
        this.verificationStatus = 'Success';
        this.snackBar.open('Successfully verified email.', 'Close', { duration: 3000, });
        setTimeout(() => this.router.navigate(['login'],), 3000);
      },
      error: () => {
        this.verificationStatus = 'error';
        this.snackBar.open('Invalid or expired token.', 'Close', { duration: 3000, });
      }
    })
  }
}
