import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ConfigService } from '../../_services/config-service';

@Component({
  selector: 'app-verify-email',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss'
})
export class VerifyEmail {
  message = signal<string>('');
  error = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private configService: ConfigService
  ) {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.verifyEmail(token);
    } else {
      this.error.set('Invalid verification link.');
    }
  }

  verifyEmail(token: string) {
    const apiUrl = this.configService.getConfig().apiUrl;
    this.http.get(`${apiUrl}/auth/verify-email?token=${token}`, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.message.set(response);
        this.error.set('');
      },
      error: (err) => {
        this.error.set(err.error || 'Failed to verify email. Please try again.');
        this.message.set('');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
