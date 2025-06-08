import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../_services/auth';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth); 
  const router = inject(Router);

    return authService.isLoggedIn$.pipe(
      map(isLoggedIn => {
        if (!isLoggedIn) {
          router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
}