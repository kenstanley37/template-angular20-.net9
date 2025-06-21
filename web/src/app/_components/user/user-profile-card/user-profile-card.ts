import { Component, Input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProfileDto } from '../../../_models/user-model';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-user-profile-card',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './user-profile-card.html',
  styleUrl: './user-profile-card.scss'
})
export class UserProfileCard {
  @Input() profile!: ProfileDto | null;
  @Input() selectedFile!: File | null;
  @Input() errorMessage!: Signal<string>;

  @Input() onFileSelected!: (event: Event) => void;
  @Input() uploadProfilePicture!: () => void;
  @Input() clearProfilePicture!: () => void;
}
