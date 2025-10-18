import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Adjust paths to your services
import { AuthService } from '../../services/auth.service';
import { DataApiController } from '../../controller/data.controlller';

// --- Interfaces ---
interface CompoundCreateUpdate {
  name: string;
  image: string;
  description: string;
}

@Component({
  selector: 'new_compound_component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newcompound.component.html'
})
export class newCompoundComponent {
  private apiController = inject(DataApiController);
  public auth = inject(AuthService);
  private router = inject(Router);

  newCompound: CompoundCreateUpdate = {
    name: '',
    image: '',
    description: ''
  };

  isLoading = signal(false);
  message = signal<string | null>(null);
  isSuccess = signal(false);

  onSubmit() {
    this.isLoading.set(true);
    this.message.set(null);
    this.isSuccess.set(false);

    // This call requires the Admin JWT, automatically attached by the interceptor
    this.apiController.createCompound(this.newCompound).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.message.set(`Successfully created compound: ${response.name}!`);
        
        // Optional: Reset form after successful submission
        this.newCompound = { name: '', image: '', description: '' };
        
        // Optional: Redirect the admin to the compound list after success
        // setTimeout(() => this.router.navigate(['/compounds']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.isSuccess.set(false);
        console.error('Compound Creation Failed:', err);
        this.message.set(err.error?.message || 'Failed to create compound. Check your permissions or network.');
      }
    });
  }
}