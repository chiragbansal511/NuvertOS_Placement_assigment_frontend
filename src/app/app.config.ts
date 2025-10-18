import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// 1. Import the necessary provider functions
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// 2. Import your JwtInterceptor
import { JwtInterceptor } from './controller/interceptor/jwt.interceptor'; // Adjust the path as needed

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    
    // --- Router Configuration ---
    provideRouter(routes),
    
    // --- HTTP Client Configuration ---
    // 3. Provide HttpClient and enable class-based interceptors (like JwtInterceptor)
    provideHttpClient(withInterceptorsFromDi()), 
    
    // 4. Register the JwtInterceptor using the legacy token
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true // Essential for registering multiple interceptors
    }
  ]
};