import { Component } from '@angular/core';
import { Menubar } from "../menubar/menubar";
import { Brand } from "../brand/brand";
import { FluidModule } from 'primeng/fluid';

@Component({
  selector: 'app-header',
  imports: [Menubar, Brand, FluidModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
