import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap } from 'rxjs/operators';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authReady$.pipe(
    take(1),
    switchMap(() => authService.user$.pipe(take(1))),
    map(user => {
      if (user && user.isAdmin) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};