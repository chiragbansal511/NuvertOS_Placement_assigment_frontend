import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, of, filter } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait until the initial token validation check is completed
  return authService.isAuthChecked$.pipe(
    filter(isReady => isReady), // Wait for true
    take(1), // Take the first value and complete
    switchMap(() => {
        // Check the current authentication state
        if (authService.isAuthenticated()) {
            return of(true); // User is logged in, grant access
        } else {
            // User is NOT logged in, redirect to login
            return of(router.createUrlTree(['/login']));
        }
    })
  );
};