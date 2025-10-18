import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-xl mx-auto my-10 p-10 bg-yellow-50 rounded-xl shadow-lg border-2 border-yellow-300 text-center">
      <h2 class="text-4xl font-extrabold text-yellow-800 mb-4">Access Denied (403)</h2>
      <p class="text-lg text-yellow-700 mb-6">
        You do not have the required permissions (role) to view the requested page.
      </p>
      <a routerLink="/" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 transition duration-150">
        Go to Home Page
      </a>
    </div>
  `
})
export class UnauthorizedComponent {}