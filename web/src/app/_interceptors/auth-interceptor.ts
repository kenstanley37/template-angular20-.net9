import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../_services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(error => {
      // Prevent infinite loop
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        console.warn('Unauthorized request, attempting to refresh token');
        return authService.refreshToken().pipe(
          switchMap(() => {
            const clonedRequest = req.clone({ withCredentials: true });
            console.log('Token refreshed, retrying request:', clonedRequest);
            return next(clonedRequest);
          }),
          catchError(refreshError => {
            console.error('Token refresh failed, redirecting to login:', refreshError);
            authService.logout().subscribe();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
