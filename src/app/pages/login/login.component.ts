import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; // Adjust path
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl : './login.component.html'
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage: string | null = null;

  onLogin() {
    this.isLoading = true;
    this.errorMessage = null;

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading = false;
        // Navigate to the private dashboard upon success
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login failed:', err);
        this.errorMessage = err.error?.message || 'Invalid credentials or server error.';
      }
    });
  }
}