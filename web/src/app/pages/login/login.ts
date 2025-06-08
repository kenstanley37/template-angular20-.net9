import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  email: string = '';
  password: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private socialAuthService: SocialAuthService
  ) { }

  login(): void {
    const credentials = { email: this.email, password: this.password };
    this.http.post(`${this.apiBaseUrl}/api/auth/login`, credentials, { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response.mfaRequired) {
          this.router.navigate(['/mfa-verify'], { queryParams: { email: this.email } });
        } else {
          this.snackBar.open('Login successful.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.snackBar.open(error.error || 'Login failed.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  loginWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID).then(user => {
      this.http.post(`${this.apiBaseUrl}/api/auth/google-login`, { token: user.idToken }, { withCredentials: true }).subscribe({
        next: () => {
          this.snackBar.open('Google login successful.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.snackBar.open(error.error || 'Google login failed.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        }
      });
    });
  }

}
