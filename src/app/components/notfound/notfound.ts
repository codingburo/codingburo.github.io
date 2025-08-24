import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-notfound',
  imports: [CommonModule, RouterModule],
  templateUrl: './notfound.html',
  styleUrl: './notfound.css',
})
export class Notfound implements OnInit {
  constructor(private router: Router, private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: '404 - Page Not Found | Cobu',
      description:
        'The page you are looking for could not be found. Return to Cobu and continue your AI brainstorming session.',
      keywords: '404, page not found, error',
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  startChat() {
    this.router.navigate(['/chat']);
  }
}
