import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
//import { AuthService } from '../_services/auth-service';
import { map } from 'rxjs';
import { hasRole } from '../_services/shared/auth-roles';
import { UserService } from '../_services/user-service';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userService = inject(UserService);

  if (!userService || typeof userService.getProfile !== 'function') {
    return router.createUrlTree(['/unauthorized']);
  }

  return userService.getProfile().pipe(
    map(profile => hasRole(profile, 'admin') ? true : router.createUrlTree(['/unauthorized']))
  );


};
