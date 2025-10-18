import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { AuthService } from './services/auth.service'; // Adjust path as necessary

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  // Inject the AuthService
  public auth = inject(AuthService);
  
  // Define the signal property to control the mobile menu
  public isMobileMenuOpen = signal(false); 

  /**
   * Toggles the state of the mobile navigation menu.
   * This function is necessary because inline event handlers don't allow arrow functions (v => !v).
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  /**
   * Closes the mobile menu after a link is clicked.
   */
  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}