import { Component } from '@angular/core';
import { Brand } from "../brand/brand";

@Component({
  selector: 'app-new-landing-component',
  imports: [Brand],
  templateUrl: './new-landing-component.html',
  styleUrl: './new-landing-component.css',
})
export class NewLandingComponent {
  currentYear = new Date().getFullYear();
}
