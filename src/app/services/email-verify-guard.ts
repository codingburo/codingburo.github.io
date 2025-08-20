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
        if (user?.emailVerified) {
          return true;
        }
        return this.router.createUrlTree(['/verify-email']);
      }),
      take(1) // Complete after first emission
    );
  }
}
