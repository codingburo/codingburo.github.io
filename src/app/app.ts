import { Component, inject, OnInit } from '@angular/core';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';
import { Fluid } from 'primeng/fluid';
import { Toast } from 'primeng/toast';
import { AuthService } from './services/auth-service';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Header, RouterOutlet, Fluid, Toast, ConfirmDialog],
  providers: [],
})
export class App implements OnInit {
  authService = inject(AuthService);
  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        // console.log('User: ', user);
        this.authService.currentUserSignal.set({
          uid: user.uid,
          email: user?.email!,
          username: user?.displayName!,
        });
      } else {
        this.authService.currentUserSignal.set(null);
      }
    });
  }
}
