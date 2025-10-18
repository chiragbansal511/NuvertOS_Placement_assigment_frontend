import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Adjust path
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl : './signup.component.html'
})
export class SignupComponent {
  auth = inject(AuthService);
  router = inject(Router);

  username = '';
  email = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;

  onSignup() {
    this.isLoading = true;
    this.errorMessage = null;

    this.auth.signup({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to the private dashboard upon successful signup (and auto-login)
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Signup failed:', err);
        this.errorMessage = err.error?.message || 'Registration failed. The email/username might be taken.';
      }
    });
  }
}