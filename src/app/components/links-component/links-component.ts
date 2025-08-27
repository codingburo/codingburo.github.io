import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-links-component',
  templateUrl: './links-component.html',
  styleUrl: './links-component.css',
  imports: [RouterLink, AvatarModule, OverlayBadgeModule, Menu],
})
export class LinksComponent implements OnInit {
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);
  items = computed<MenuItem[]>(() => [
    {
      label: this.authService.currentUserSignal()?.username || 'User',

      items: [
        {
          separator: true,
        },

        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: () => this.logout(),
        },
        { separator: true },
        {
          label: this.authService.currentUserSignal()?.email || 'No email',
          styleClass: 'menu-item',
        },
        {
          label: 'Logged In using ' + this.userProvider(),
          styleClass: 'menu-item',
        },
      ],
    },
  ]);

  ngOnInit() {}

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        console.log('Problem Logging Out');
      },
    });
  }

  userImage = computed(
    () =>
      this.authService.currentUserSignal()?.photoURL ||
      'images/profile-placeholder.png'
  );
  userTitle = computed(
    () => this.authService.currentUserSignal()?.username || 'No User'
  );

  userProvider = computed(() => {
    const loginMethod = this.authService.currentUserSignal()?.loginMethod;
    return loginMethod || 'Unknown';
  });
}
