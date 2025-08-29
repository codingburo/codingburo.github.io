import { Component, inject, OnInit } from '@angular/core';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';
import { AuthService } from './services/auth-service';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Header, RouterOutlet, Toast, ConfirmDialog],
  providers: [],
})
export class App implements OnInit {
  authService = inject(AuthService);
  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSignal.set({
          uid: user.uid,
          email: user?.email!,
          username: user?.displayName!,
          photoURL: user?.photoURL || undefined,
          loginMethod: this.getLoginMethod(user),
        });
      } else {
        this.authService.currentUserSignal.set(null);
      }
    });
  }

  getLoginMethod = (user: any) => {
    if (user.providerData && user.providerData.length > 0) {
      const providerId = user.providerData[0].providerId; // Access first element
      switch (providerId) {
        case 'google.com':
          return 'Google';
        case 'github.com':
          return 'GitHub';
        case 'password':
          return 'Email';
        case 'facebook.com':
          return 'Facebook';
        default:
          return providerId; // Return the actual provider ID if unknown
      }
    }
    return 'Email';
  };
}


