import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../_services/auth';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
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
