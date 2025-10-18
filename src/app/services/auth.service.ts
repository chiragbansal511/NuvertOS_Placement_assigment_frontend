import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, map, throwError } from 'rxjs'; // throwError is now imported
import { AUthApiController } from '../controller/auth.controller'; // Adjust path as necessary

// --- Interface Definitions (Matching the data we care about) ---

// Define the core user data structure needed by the app
interface AppUser {
  id: number;
  email: string;
  role: string;
  username: string;
}

// Minimal structure for login/signup input
interface Credentials {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authApi = inject(AUthApiController);
  private router = inject(Router);

  // ⭐️ 1. STATE MANAGEMENT (The "Context") ⭐️
  
  private userSubject = new BehaviorSubject<AppUser | null>(null);
  public user$ = this.userSubject.asObservable();
  
  private isAuthCheckedSubject = new BehaviorSubject<boolean>(false);
  public isAuthChecked$ = this.isAuthCheckedSubject.asObservable();

  constructor() {
    this.initialTokenValidation();
  }
  
  // --- Core State Mutators ---

  /**
   * Updates the application state and persists token/role/username to storage.
   */
  private setUserState(user: AppUser, token: string | null): void {
    if (token) {
        localStorage.setItem('access_token', token);
    } else {
        localStorage.removeItem('access_token');
    }
    this.userSubject.next(user);
    localStorage.setItem('userRole', user.role); // Role persistence
    localStorage.setItem('userUsername', user.username); // Username persistence
  }
  
  // --- Initial Check (Run once on app load) ---

  /**
   * Checks for a stored JWT and verifies it via the API.
   */
  private initialTokenValidation(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
        this.userSubject.next(null);
        this.isAuthCheckedSubject.next(true); // Check done
        return;
    }

    // Call the dedicated API service function
    this.authApi.checkAndGetUserData()
      .pipe(
        tap(response => {
          const username = localStorage.getItem('userUsername') || 'User';
          this.userSubject.next({
            id: response.user.id,
            email: response.user.email,
            role: response.user.role,
            username: username
          });
        }),
        catchError(err => {
          // Token invalid/expired/server error (401, 403)
          this.logout(false); // Clear local state without navigating
          return of(null); // Return an observable to keep the stream alive
        })
      )
      .subscribe(() => {
        this.isAuthCheckedSubject.next(true); 
      });
  }

  // --- API Interaction & Response Handling ---

  /**
   * Handles user login via API call.
   * Includes error handling to clear state if login fails.
   */
  login(credentials: Credentials): Observable<AppUser> {
    return this.authApi.login(credentials).pipe(
      map(response => {
        const { user, token } = response;
        const appUser: AppUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username 
        };
        
        this.setUserState(appUser, token);
        return appUser;
      }),
      catchError(err => {
        // If login fails, clear any potential stale state and re-throw the error 
        // for the component (LoginComponent) to handle the message display.
        this.logout(false); 
        return throwError(() => err);
      })
    );
  }
  
  /**
   * Handles user signup via API call.
   * Includes error handling to clear state if signup fails.
   */
  signup(userData: Credentials & { username: string }): Observable<AppUser> {
    return this.authApi.signup(userData).pipe(
      map(response => {
        const { user, token } = response;
        const appUser: AppUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username 
        };
        
        this.setUserState(appUser, token);
        return appUser;
      }),
      catchError(err => {
        // If signup fails, clear any potential stale state and re-throw the error
        this.logout(false); 
        return throwError(() => err);
      })
    );
  }
  
  /**
   * Clears all authentication state.
   * @param shouldRedirect - Flag to determine if the user should be routed to /login.
   */
  logout(shouldRedirect: boolean = true): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userUsername');
    this.userSubject.next(null); // Clear the user state
    
    if (shouldRedirect) {
        this.router.navigate(['/login']);
    }
    this.isAuthCheckedSubject.next(true); 
  }
  
  // --- Public Getters (Used by Guards, Components, and Templates) ---
  
  isAuthenticated(): boolean {
    return !!this.userSubject.value; 
  }
  
  getUserRole(): string | null {
    return this.userSubject.value ? this.userSubject.value.role : null;
  }
  
  getCurrentUser(): AppUser | null {
    return this.userSubject.value;
  }
}