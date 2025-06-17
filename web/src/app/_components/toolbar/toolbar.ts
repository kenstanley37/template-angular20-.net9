import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../_services/auth-service';
import { Profile } from '../../_pages/user/profile/profile';
import { ProfileDto } from '../../_models/user-model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  profile: ProfileDto | null = null;

  // Access signal values directly
  get isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  get getProfile() {
    return this.authService.userProfile();
  }

  constructor() {
    // Fetch profile only if not already set
    if (!this.authService.userProfile()) {
      this.authService.getProfile().subscribe({
        next: (profile) => {
          this.profile = profile
          console.log('Profile fetched:', profile);
          console.log('isAuthenticated:', this.isAuthenticated);
        },
        error: (err) => console.error('Error fetching profile:', err)
      });
    }
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error('Logout failed:', err)
    });
  }
}
