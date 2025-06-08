import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '../../_services/auth';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  user: any = {};
  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    @Inject(Auth) private authService: Auth
  ) { }

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => this.user = user,
      error: () => this.snackBar.open('Failed to load profile.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadProfileImage(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select an image.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.http.post(`${this.apiBaseUrl}/api/user/upload-profile-image`, formData, { withCredentials: true }).subscribe({
      next: (response: any) => {
        this.user.profileImageUrl = response.profileImageUrl;
        this.snackBar.open('Profile image uploaded successfully.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
      },
      error: () => this.snackBar.open('Failed to upload image.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }
}
