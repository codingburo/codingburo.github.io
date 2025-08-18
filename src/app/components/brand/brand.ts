import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BrandLogo } from '../brand-logo/brand-logo';

@Component({
  selector: 'app-brand',
  imports: [RouterLink, BrandLogo],
  templateUrl: './brand.html',
  styleUrl: './brand.css',
})
export class Brand {
  protected readonly title = signal('Coding Buro');
}
