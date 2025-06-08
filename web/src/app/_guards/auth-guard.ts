import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../_services/auth-service';
import { Observable, map } from 'rxjs';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); 
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