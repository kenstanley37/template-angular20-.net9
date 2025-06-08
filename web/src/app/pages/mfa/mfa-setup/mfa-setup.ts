import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mfa-setup',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './mfa-setup.html',
  styleUrl: './mfa-setup.scss'
})
export class MfaSetup {
private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  qrCodeUrl: string = '';
  totpCode: string = '';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.http.get(`${this.apiBaseUrl}/api/user/mfa-qr`, { withCredentials: true }).subscribe({
      next: (response: any) => this.qrCodeUrl = response.qrCodeUrl,
      error: () => this.snackBar.open('Failed to load QR code.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  enableMfa(): void {
    this.http.post(`${this.apiBaseUrl}/api/user/enable-mfa`, { totpCode: this.totpCode }, { withCredentials: true }).subscribe({
      next: () => {
        this.snackBar.open('MFA enabled successfully.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
      },
      error: (error) => this.snackBar.open(error.error || 'Invalid TOTP code.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }
}
