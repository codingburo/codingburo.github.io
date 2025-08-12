import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Brand } from '../brand/brand';
@Component({
  selector: 'app-home-card',
  imports: [CardModule, ButtonModule, Brand, CommonModule],
  templateUrl: './home-card.html',
  styleUrl: './home-card.css',
})
export class HomeCard {
  @Input() isVisible: boolean = true;
}
