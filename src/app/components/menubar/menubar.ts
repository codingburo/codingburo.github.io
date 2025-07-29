import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar/sidebar';
import { Avatar } from 'primeng/avatar';
import { APP_CONFIG } from '../../constants/app.constants';
import { Brand } from '../brand/brand';
@Component({
  selector: 'app-menubar',
  imports: [
    MenubarModule,
    BadgeModule,
    CommonModule,
    SidebarComponent,
    Avatar,
    Brand,
  ],
  templateUrl: './menubar.html',
  styleUrl: './menubar.css',
})
export class Menubar implements OnInit {
  items: MenuItem[] | undefined;
  sbaweb_link = `${APP_CONFIG.SBAWEB_LINK}`;

  ngOnInit() {
    this.items = [];
  }
}
