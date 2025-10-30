import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Added DatePipe for template
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Added Router
import { FormsModule } from '@angular/forms'; // Added FormsModule for the edit form
import { switchMap, of, EMPTY } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { DataApiController } from '../../controller/data.controlller';

interface Compound {
  id: number;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CompoundCreateUpdate {
  name: string;
  image: string;
  description: string;
}

@Component({
  selector: 'compound_detail',
  standalone: true,
  // Added FormsModule and DatePipe to imports
  imports: [CommonModule, RouterModule, FormsModule, DatePipe], 
  templateUrl: './compounddata.component.html',
})
export class CompoundDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router); // Inject Router for navigation after delete
  private apiController = inject(DataApiController);
  public auth = inject(AuthService);

  compound = signal<Compound | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null); // New signal for success notifications

  // State for in-place editing
  isEditing = signal(false);
  editableCompound = signal<CompoundCreateUpdate>({ name: '', image: '', description: '' });

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading.set(true);
          this.error.set(null);
          this.successMessage.set(null); // Clear messages on new load
          return this.apiController.getCompoundById(+id);
        }
        this.error.set("No compound ID provided in the URL.");
        return of(null);
      })
    ).subscribe({
      next: (compound) => {
        this.isLoading.set(false);
        if (compound) {
          this.compound.set(compound);
        } else {
          // Only set error if no compound was found AND no previous error was set (like 'No ID provided')
          if (!this.error()) {
              this.error.set("Compound not found.");
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Failed to load compound: ${err.message || 'Network error'}`);
        console.error('Error fetching compound details:', err);
      }
    });
  }

  toggleEditMode(): void {
    const compound = this.compound();
    if (!compound || this.auth.getUserRole() !== 'admin') return;

    this.isEditing.update(val => !val);
    this.error.set(null);
    this.successMessage.set(null);

    if (this.isEditing()) {
        // Populate the editable signal with a copy of the current compound data
        this.editableCompound.set({
            name: compound.name,
            image: compound.image,
            description: compound.description
        });
    }
  }

  saveCompound(): void {
    const compound = this.compound();
    if (!compound || this.auth.getUserRole() !== 'admin') return;

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const dataToUpdate = this.editableCompound();

    this.apiController.updateCompound(compound.id, dataToUpdate).subscribe({
      next: (updatedCompound) => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        
        // Update the main signal with the API response
        this.compound.set(updatedCompound);
        this.successMessage.set(`Successfully updated compound: ${updatedCompound.name}`);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Update failed: ${err.error?.message || err.message || 'Check your permissions or data format.'}`);
        console.error('Update failed:', err);
      }
    });
  }

  deleteCompound(): void {
    const compound = this.compound();
    if (!compound || this.auth.getUserRole() !== 'admin') return;

    if (!confirm(`Are you sure you want to delete the compound: ${compound.name}? This action cannot be undone.`)) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    this.apiController.deleteCompound(compound.id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set(`Successfully deleted compound: ${compound.name}. Redirecting...`);
        
        // Navigate back to the list after a short delay
        setTimeout(() => {
            this.router.navigate(['/compounds']); 
        }, 2000); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Deletion failed: ${err.error?.message || err.message || 'Check your permissions or network.'}`);
        console.error('Deletion failed:', err);
      }
    });
  }
}
