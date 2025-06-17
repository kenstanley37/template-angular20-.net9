import { Injectable } from '@angular/core';
import { ConfigService } from './config-service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ProfileDto } from '../_models/user-model';
import { AuthService } from './auth-service';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';

declare global {
  interface Window {
    google: typeof google;
  }
}

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private client: any;

  constructor(private configService: ConfigService, private httpClient: HttpClient, private authService: AuthService, private router: Router) {
    const interval = setInterval(() => {
      if ((window as any).google && google.accounts) {
        clearInterval(interval);
        this.initializeClient();
      }
    }, 100);
  }

  private initializeClient() {
    this.client = google.accounts.id.initialize({
      client_id: this.configService.getConfig().googleClientId,
      callback: this.handleCredentialResponse.bind(this)
    });
  }

  private handleCredentialResponse(response: any) {
    console.log('Credential:', response.credential);
    this.authService.socialLogin('google-login', {
      token: response.credential,
      stayLoggedIn: false
    }).pipe(
      map((user: ProfileDto) => {
        console.log('Name:', user.name);
        console.log('Email:', user.email);
        console.log('Profile Picture:', user.profilePicture);
        this.router.navigate(['/profile']);
        return user;
      }),
      catchError((error) => {
        console.error('Error:', error);
        return of(null);
      })
    ).subscribe();
  }

  public promptSignIn() {
    if (this.client) {
      google.accounts.id.prompt();
    }
  }
}