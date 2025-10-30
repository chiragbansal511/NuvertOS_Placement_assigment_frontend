import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { DataApiController } from '../../controller/data.controlller';

interface Compound {
  id: number;
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

  compoundList = signal<CompoundList>({ compounds: [], totalItems: 0, totalPages: 0 });
  currentPage = signal(1);
  limit = signal(10);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchCompounds();
  }

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

  viewDetails(compound: Compound): void {
    this.router.navigate(['/compound', compound.id]);
  }
}
