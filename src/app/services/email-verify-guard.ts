import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, CanActivate,  GuardResult,  MaybeAsync,  Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from './auth-service';
import { map, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmailVerifyGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      map((user) => {
        if (user) {
          // Allow access if email is verified OR if it's a social sign-in
          const isSocialSignIn = user.providerData.some(
            (provider) =>
              provider.providerId === 'google.com' ||
              provider.providerId === 'github.com' ||
              provider.providerId === 'twitter.com'
          );

          if (user.emailVerified || isSocialSignIn) {
            return true;
          }
        }
        return this.router.createUrlTree(['/verify-email']);
      }),
      take(1)
    );
  }
}
