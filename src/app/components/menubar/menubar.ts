import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { Badge } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';


import { Brand } from '../brand/brand';
import { LinksComponent } from '../links-component/links-component';
@Component({
  selector: 'app-menubar',
  imports: [
    Menubar,
    Badge,
    CommonModule,
    SidebarComponent,
    Brand,
    LinksComponent,
  ],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css',
})
export class AppMenubar implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [];
  }
}
