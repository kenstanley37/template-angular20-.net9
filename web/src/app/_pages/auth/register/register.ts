import { Component, signal } from '@angular/core';
import { AuthService } from '../../../_services/auth-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { R } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.errorMessage.set('');
          this.successMessage.set(response || 'User registered successfully. Please check your email to verify your account.');
          this.registerForm.reset();
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.successMessage.set('');
        }
      });
    } else {
      this.errorMessage.set('Please fill out all required fields correctly.');
      this.successMessage.set('');
    }
  }


}
