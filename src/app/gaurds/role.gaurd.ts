import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, of, filter } from 'rxjs';

export const RoleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the roles defined in the route data (e.g., data: { roles: ['admin'] })
  const expectedRoles = route.data['roles'] as Array<string>;

  return authService.isAuthChecked$.pipe(
    filter(isReady => isReady),
    take(1),
    switchMap(() => {
        const userRole = authService.getUserRole();
        
        if (userRole && expectedRoles && expectedRoles.includes(userRole)) {
            return of(true); // User has the required role
        }
        
        // If not authenticated or role is wrong, redirect home/unauthorized
        return of(router.createUrlTree(['/unauthorized']));
    })
  );
};