import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule], // Include RouterModule for routerLink
  templateUrl : './home.component.html'
})
export class HomeComponent {
    public auth = inject(AuthService);
}
