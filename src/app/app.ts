import { Component, inject, OnInit } from '@angular/core';
import { Header } from './components/header/header';
import { RouterOutlet } from '@angular/router';
import { Fluid } from 'primeng/fluid';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from './services/auth-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Header, RouterOutlet, Fluid, Toast],
  providers: [MessageService],
})
export class App implements OnInit {
  authService = inject(AuthService);
  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.authService.currentUserSignal.set({
          email: user?.email!,
          username: user?.displayName!,
        });
      } else {
        this.authService.currentUserSignal.set(null);
      }
    });
  }
}
