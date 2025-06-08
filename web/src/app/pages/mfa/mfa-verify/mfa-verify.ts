import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfa-verify',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './mfa-verify.html',
  styleUrl: './mfa-verify.scss'
})
export class MfaVerify {
private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  email: string | undefined = '';
  totpCode: string = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') || undefined;
  }

  verifyMfa(): void {
    const mfaData = { email: this.email!, totpCode: this.totpCode };
    this.http.post(`${this.apiBaseUrl}/api/auth/verify-mfa`, mfaData, { withCredentials: true }).subscribe({
      next: () => {
        this.snackBar.open('MFA verified successfully.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => this.snackBar.open(error.error || 'Invalid TOTP code.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }
}
