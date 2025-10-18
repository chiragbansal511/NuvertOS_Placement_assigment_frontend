import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { urienvironment } from '../environment/url.environment';

// Standard data structure for user details
interface UserData {
  id: number;
  email: string;
  role: string;
  username: string;
  password?: string; // Optional, as it shouldn't be used on the client side
  createdAt?: string;
  updatedAt?: string;
}

// 1. Login/Signup/Admin Create Request Structure
interface AuthRequest {
  username: string;
  email: string;
  password: string;
  role?: string; // Only used for admin creation
}

// 2. Login/Signup/Admin Create Response Structure
interface AuthResponse {
  user: UserData;
  token: string;
}

// 3. Verify Token Response Structure
interface VerifyResponse {
  message: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}


@Injectable({
  providedIn: 'root'
})
export class AUthApiController {
  private baseUrl = urienvironment.apiBaseUrlAuth;

  constructor(private http: HttpClient) { }

  login(credentials: Pick<AuthRequest, 'email' | 'password'>): Observable<AuthResponse> {
    // Assuming your backend can accept email and password directly. 
    // We send an object with email and password.
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  // 2. New User Signup Request (Public Registration)
  // ----------------------------------------------------------------------

  /**
   * Registers a new user account.
   * @param userData - The required data (username, email, password) for registration.
   * @returns Observable<AuthResponse> - Returns the JWT token for the newly created user and their details.
   */
  signup(userData: Pick<AuthRequest, 'username' | 'email' | 'password'>): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, userData);
  }

  // 3. JWT Validation and User Fetch
  // ----------------------------------------------------------------------

  /**
   * Calls the API to validate the JWT (sent via the JwtInterceptor) and fetch the core user data.
   * @returns Observable<VerifyResponse> - Contains the verification message and core user data (id, email, role).
   */
  checkAndGetUserData(): Observable<VerifyResponse> {
    // Endpoint that requires a valid JWT in the Authorization header.
    return this.http.get<VerifyResponse>(`${this.baseUrl}/verify`);
  }

  // 4. Admin Create Account Request (Role-Based)
  // ----------------------------------------------------------------------

  /**
   * Allows an authorized admin to create a new user account, specifying all details including role.
   * Requires the admin's own JWT in the Authorization header.
   * @param userData - Full data for the new user, including username, email, password, and role.
   * @returns Observable<AuthResponse> - The details of the newly created user and their token.
   */
  adminCreateAccount(userData: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/admin/signup`, userData);
  }
}