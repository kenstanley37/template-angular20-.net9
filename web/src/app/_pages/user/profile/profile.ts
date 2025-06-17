import { Component, OnInit, signal } from '@angular/core';
import { ProfileDto, UpdateProfilePictureDto } from '../../../_models/user-model';
import { AuthService } from '../../../_services/auth-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  profile!: ProfileDto;
  errorMessage = signal<string>('');
  selectedFile: File | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.getProfile();
  }

  getProfile() {
    if (!this.profile) {
      this.authService.getProfile().subscribe({
        next: (profile: ProfileDto) => this.profile = profile,
        error: (err: Error) => this.errorMessage.set(err.message)
      });
    }

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      if (!this.selectedFile.type.match('image/jpeg|image/png')) {
        this.errorMessage.set('Please select a JPEG or PNG image.');
        this.selectedFile = null;
        return;
      }
      if (this.selectedFile.size > 2 * 1024 * 1024) {
        this.errorMessage.set('Image size must be less than 2MB.');
        this.selectedFile = null;
        return;
      }
    }
  }

  uploadProfilePicture() {
    if (!this.selectedFile) {
      this.errorMessage.set('No file selected.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      const dto: UpdateProfilePictureDto = { profilePicture: base64Image };
      this.authService.updateProfilePicture(dto).subscribe({
        next: () => {
          this.errorMessage.set('');
          this.authService.getProfile().subscribe((profile: ProfileDto) => this.profile = profile);
        },
        error: (err: Error) => this.errorMessage.set(err.message)
      });
    };
    reader.onerror = () => this.errorMessage.set('Error reading file.');
    reader.readAsDataURL(this.selectedFile);
  }

  clearProfilePicture() {
    const authData: UpdateProfilePictureDto = { profilePicture: undefined };
    this.authService.updateProfilePicture(authData).subscribe({
      next: () => {
        this.errorMessage.set('');
        this.authService.getProfile().subscribe((profile: ProfileDto) => this.profile = profile);
      },
      error: (err: Error) => this.errorMessage.set(err.message)
    });
  }
}