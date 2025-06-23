import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../_services/auth-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { LoginDto, SocialLoginDto } from '../../../_models/user-model';
import { GoogleAuthService } from '../../../_services/google-auth-service';
import { UserService } from '../../../_services/user-service';


@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    RouterLink,
    MatCheckboxModule

  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private googleAuthService: GoogleAuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      stayLoggedIn: [false]
    });
  }
  ngOnInit(): void {

  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    const loginDto: LoginDto = this.loginForm.value;
    this.authService.login(loginDto).subscribe({
      next: () => {
        this.userService.getProfile().subscribe({
          next: (profile) => {
            this.userService.setProfile(profile);
            this.router.navigate(['/']);
          },
          error: (err: Error) => {
            this.errorMessage = err.message;
          }
        });
      },
      error: (err: Error) => this.errorMessage = err.message
    });
  }

  triggerSignIn() {
    this.googleAuthService.promptSignIn();
  }

}
