import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { urienvironment } from '../environment/url.environment'; // Base URL for the compound endpoints

// --- Interfaces for Compound Data ---

interface Compound {
  id: number;
  name: string;
  image: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CompoundListResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  compounds: Compound[];
}

interface CompoundCreateUpdate {
  name: string;
  image: string;
  description: string;
}

interface PaginationParams {
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataApiController {
  // Assuming a separate base URL for compounds in your environment file
  private baseUrl = urienvironment.apiBaseUrlData;

  constructor(private http: HttpClient) { }

  // Helper function to handle common API errors (similar to AuthController)
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Compound API Error ${error.status}:`, error.error);
    return throwError(() => error);
  }

  // 1. READ ALL (Paginated List) - GET /compounds?page=X&limit=Y
  // ----------------------------------------------------------------------
  getCompounds({ page, limit }: PaginationParams): Observable<CompoundListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<CompoundListResponse>(`${this.baseUrl}/`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // 2. READ ONE (By ID) - GET /compounds/:id
  // ----------------------------------------------------------------------
  getCompoundById(id: number): Observable<Compound> {
    return this.http.get<Compound>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 3. CREATE NEW COMPOUND - POST /compounds
  // ----------------------------------------------------------------------
  createCompound(data: CompoundCreateUpdate): Observable<Compound> {
    // Requires JWT for authentication/authorization (handled by JwtInterceptor)
    return this.http.post<Compound>(`${this.baseUrl}/`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 4. UPDATE COMPOUND - PUT /compounds/:id
  // ----------------------------------------------------------------------
  updateCompound(id: number, data: CompoundCreateUpdate): Observable<Compound> {
    // Requires JWT for authentication/authorization (handled by JwtInterceptor)
    return this.http.put<Compound>(`${this.baseUrl}/${id}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // 5. DELETE COMPOUND - DELETE /compounds/:id
  // ----------------------------------------------------------------------
  deleteCompound(id: number): Observable<Compound> {
    // Requires JWT for authentication/authorization (handled by JwtInterceptor)
    return this.http.delete<Compound>(`${this.baseUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }
}