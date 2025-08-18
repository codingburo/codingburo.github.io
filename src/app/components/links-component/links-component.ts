import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-links-component',
  templateUrl: './links-component.html',
  styleUrl: './links-component.css',
  imports: [RouterLink],
})
export class LinksComponent  {
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/signin');
      },
      error: (err) => {
        console.log('Problem Logging Out');
      },
    });
  }
}
