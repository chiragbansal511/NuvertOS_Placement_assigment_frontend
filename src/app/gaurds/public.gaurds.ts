import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, of, filter } from 'rxjs';

export const PublicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthChecked$.pipe(
    filter(isReady => isReady),
    take(1),
    switchMap(() => {
        // Check the current authentication state
        if (!authService.isAuthenticated()) {
            return of(true); // User is NOT logged in, grant access to public page
        } else {
            // User IS logged in, redirect to dashboard/home
            return of(router.createUrlTree(['/dashboard']));
        }
    })
  );
};