import { Component, OnInit, signal } from '@angular/core';
import { ProfileDto, UpdateProfilePictureDto } from '../../../_models/user-model';
import { AuthService } from '../../../_services/auth-service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
//import { GoogleAds } from "../../../_components/ads/google-ads/google-ads";
//import { UserProfileCard } from '../../../_components/user/user-profile-card/user-profile-card';
import { SkeletonCard } from "../../../_components/skeleton-card/skeleton-card";
import { ConfirmService } from '../../../_services/confirm-service';


@Component({
  selector: 'app-profile',
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatIconModule, SkeletonCard],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {

  profile = signal<ProfileDto | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | undefined>(undefined);
  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private confirmService: ConfirmService
  ) {
    this.loadProfile();
  }

  ngOnInit() {
    //this.getProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(undefined);

    const cachedProfile = this.authService.getUserProfile();
    if (cachedProfile) {
      this.profile.set(cachedProfile);
      this.isLoading.set(false);
      return;
    }

    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load profile');
        this.isLoading.set(false);
        //this.toastr.error(this.errorMessage(), 'Profile Error');
      }
    });
  }

  getProfile() {
    if (!this.profile) {
      this.authService.getProfile().subscribe({
        next: (profile: ProfileDto) => this.profile.set(profile),
        error: (err: Error) => this.errorMessage.set(err.message)
      });
    }

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        //this.toastr.error('File size must be less than 2MB', 'Upload Error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        //this.toastr.error('Please select an image file', 'Upload Error');
        return;
      }
      this.selectedFile = file;
      this.uploadProfilePicture();
    }
  }

  private uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.isLoading.set(true);
    this.errorMessage.set(undefined);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1]; // Remove data:image/...;base64,
      const dto: UpdateProfilePictureDto = { profilePicture: base64String };

      this.authService.updateProfilePicture(dto).subscribe({
        next: (message) => {
          this.isLoading.set(false);
          //this.toastr.success('Profile picture updated', 'Success');
          this.selectedFile = null;
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to update profile picture');
          //this.toastr.error(this.errorMessage(), 'Upload Error');
        }
      });
    };
    reader.onerror = () => {
      this.isLoading.set(false);
      this.errorMessage.set('Failed to read file');
      //this.toastr.error(this.errorMessage(), 'Upload Error');
    };
    reader.readAsDataURL(this.selectedFile);
  }

  clearProfilePicture() {
    const authData: UpdateProfilePictureDto = { profilePicture: undefined };
    this.authService.updateProfilePicture(authData).subscribe({
      next: () => {
        this.errorMessage.set('');
        this.authService.getProfile().subscribe((profile: ProfileDto) => this.profile.set(profile));
      },
      error: (err: Error) => this.errorMessage.set(err.message)
    });
  }

  confirmDeleteAccount() {
    this.confirmService.confirm({
      title: 'Confirm Account Deletion',
      message: 'Are you sure you want to delete your account? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    }).then((result) => {
      if (result) {
        // Proceed with account deletion
        console.log('Account deletion confirmed');
      }
    });
  }
}