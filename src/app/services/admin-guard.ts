// src/app/guards/admin.guard.ts
import { inject, runInInjectionContext, Injector } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const injector = inject(Injector);

  return runInInjectionContext(injector, () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const adminEmails = ['syedbaqirali@gmail.com'];

    return authService.user$.pipe(
      take(1),
      map((user) => {

        if (user?.email && adminEmails.includes(user.email)) {
          return true;
        }

        router.navigate(['/chat']);
        return false;
      })
    );
  });
};
