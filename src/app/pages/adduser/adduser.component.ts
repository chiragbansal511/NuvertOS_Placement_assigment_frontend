import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AUthApiController } from '../../controller/auth.controller';
import { Router , RouterModule} from '@angular/router';

interface NewUserForm {
  username: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'add_user',
  standalone: true,
  imports: [CommonModule , FormsModule, RouterModule],
  templateUrl : './adduser.component.html'
})
export class AddUserComponent {
   private apiController = inject(AUthApiController);
  private router = inject(Router);

  newUser: NewUserForm = {
    username: '',
    email: '',
    password: '',
    role: 'user' // Default role
  };

  isLoading = false;
  message: string | null = null;
  isSuccess = false;

  onSubmit() {
    this.isLoading = true;
    this.message = null;

    // The API controller handles the manual JWT attachment for this request
    this.apiController.adminCreateAccount(this.newUser).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = `Successfully created user`;
        
        // Optional: Reset form after success
        this.newUser = { username: '', email: '', password: '', role: 'user' };
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        console.error('Admin Create User Failed:', err);
        // Display a generic admin error message
        this.message = err.error?.message || 'Failed to create user. Check your permissions or network.';
      }
    });
  }
}