import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { switchMap, of, EMPTY } from 'rxjs';

// Adjust paths to your services
import { AuthService } from '../../services/auth.service';
import { DataApiController } from '../../controller/data.controlller';
// --- Interface (Matching CompoundApiController's Compound interface) ---
interface Compound {
  id: number;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'compound_detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compounddata.component.html',
})
export class CompoundDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiController = inject(DataApiController);
  public auth = inject(AuthService); // Used for conditional button rendering

  // --- State Signals ---
  compound = signal<Compound | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // 1. Subscribe to route parameters
    this.route.paramMap.pipe(
      // 2. Extract the 'id' parameter (which is a string)
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading.set(true);
          this.error.set(null);
          // 3. Call API controller with the parsed ID
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
          this.error.set("Compound not found.");
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(`Failed to load compound: ${err.message || 'Network error'}`);
        console.error('Error fetching compound details:', err);
      }
    });
  }
}