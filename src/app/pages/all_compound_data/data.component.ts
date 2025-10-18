import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// --- External Service/Controller Imports (Adjust paths as needed) ---
import { AuthService } from '../../services/auth.service';
import { DataApiController } from '../../controller/data.controlller';
// --- Interfaces for State and Data (Replicated from Controller) ---

interface Compound {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface CompoundCreateUpdate {
  name: string;
  image: string;
  description: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface CompoundList {
    compounds: Compound[];
    totalItems: number;
    totalPages: number;
}

// --- Component Definition ---

@Component({
  selector: 'data_compound',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data.component.html'
})
export class DataCompound implements OnInit {
  private apiController = inject(DataApiController);
  public auth = inject(AuthService);
  private router = inject(Router);

  // --- State Signals ---
  compoundList = signal<CompoundList>({ compounds: [], totalItems: 0, totalPages: 0 });
  currentPage = signal(1);
  limit = signal(10);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null); // New signal for success notifications

  selectedCompound = signal<Compound | null>(null);
  isEditing = signal(false);
  editableCompound = signal<CompoundCreateUpdate>({ name: '', image: '', description: '' }); 

  ngOnInit(): void {
    this.fetchCompounds();
  }

  // --- Data Fetching ---

  fetchCompounds(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);
    const params: PaginationParams = { page: this.currentPage(), limit: this.limit() };

    this.apiController.getCompounds(params).subscribe({
      next: (response) => {
        this.compoundList.set({
          compounds: response.compounds,
          totalItems: response.totalItems,
          totalPages: response.totalPages
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Failed to fetch compounds. Check API or permissions.');
        console.error(err);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.compoundList().totalPages) {
      this.currentPage.set(page);
      this.fetchCompounds();
    }
  }

  // --- Detail and Edit Logic ---

  viewDetails(compound: Compound): void {
    this.selectedCompound.set(compound);
    this.isEditing.set(false);
  }

  clearSelection(): void {
    this.selectedCompound.set(null);
    this.isEditing.set(false);
    this.error.set(null);
    this.successMessage.set(null);
  }

  toggleEditMode(): void {
    const compound = this.selectedCompound();
    if (!compound || this.auth.getUserRole() !== 'admin') return;

    this.isEditing.update(val => !val);

    // If entering edit mode, populate the editable signal
    if (this.isEditing()) {
        this.editableCompound.set({
            name: compound.name,
            image: compound.image,
            description: compound.description
        });
    }
  }

  saveCompound(): void {
    if (!this.selectedCompound() || this.auth.getUserRole() !== 'admin') return;

    this.isLoading.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const compoundId = this.selectedCompound()!.id;
    const dataToUpdate = this.editableCompound();

    this.apiController.updateCompound(compoundId, dataToUpdate).subscribe({
      next: (updatedCompound) => {
        this.isLoading.set(false);
        this.isEditing.set(false);
        
        // 1. Update the local detail view
        this.selectedCompound.set(updatedCompound);
        this.successMessage.set(`Successfully updated compound: ${updatedCompound.name}`);
        
        // 2. Refresh the list to show changes
        this.fetchCompounds(); 
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Update failed. Check your permissions or data format.');
        console.error(err);
      }
    });
  }

  // --- Delete Logic (Admin Only) ---
  deleteCompound(): void {
    const compound = this.selectedCompound();
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
        this.successMessage.set(`Successfully deleted compound: ${compound.name}.`);
        
        // Clear selection and fetch the list to show the removed item is gone.
        this.clearSelection(); 
        this.fetchCompounds();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Deletion failed. Check your permissions or network.');
        console.error(err);
      }
    });
  }
}