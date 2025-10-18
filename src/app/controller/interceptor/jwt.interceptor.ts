import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor() {}

  /**
   * Intercepts outgoing HTTP requests.
   * @param request - The outgoing request object.
   * @param next - The next interceptor in the chain or the backend handler.
   * @returns An Observable of the HTTP event.
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Get the token from local storage (or wherever you store it)
    const token = localStorage.getItem('access_token'); // Assuming you store the token under the key 'authToken'
    // 2. Clone the request and add the Authorization header if a token exists
    if (token) {
      // Clone the request and set the new header
      request = request.clone({
        setHeaders: {
          // Standard format for JWT authentication: 'Bearer <token>'
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. Pass the (potentially cloned) request to the next handler
    return next.handle(request);
  }
}