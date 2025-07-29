import { Component } from '@angular/core';
import { Menubar } from '../menubar/menubar';
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-header',
  imports: [Menubar, FluidModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
