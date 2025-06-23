import { inject, Injectable } from '@angular/core';
import { ConfigService } from './config-service';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ProfileDto } from '../_models/user-model';
import { AuthService } from './auth-service';
import { catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserService } from './user-service';

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
  private userService = inject(UserService);
  private configService = inject(ConfigService);
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
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

    google.accounts.id.renderButton(
      document.getElementById("google-button"),
      { theme: "outline", size: "large" }  // customization attributes
    );
  }

  private handleCredentialResponse(response: any) {
    console.log('Credential:', response.credential);
    this.authService.googleLogin(response.credential).pipe(
      map((profile: ProfileDto) => {
        this.userService.setProfile(profile);
        this.authService.setIsAuthenticated(true);
        this.router.navigate(['/profile']);
        
        return profile;
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