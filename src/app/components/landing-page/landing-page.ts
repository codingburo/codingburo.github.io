import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Brand } from "../brand/brand";
import { BrandLogo } from '../brand-logo/brand-logo';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, Brand, BrandLogo],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  currentYear = new Date().getFullYear();
}
