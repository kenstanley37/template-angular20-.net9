import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth-service';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin$.pipe(
      map(isAdmin => {
        if (!isAdmin) {
          router.navigate(['/dashboard']);
          return false;
        }
        return true;
      })
    );
};
