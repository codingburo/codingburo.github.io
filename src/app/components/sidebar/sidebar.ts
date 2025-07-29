import { Component, ViewChild } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Brand } from "../brand/brand";
import { Socials } from "../socials/socials";
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-sidebar',
  imports: [DrawerModule, ButtonModule, AvatarModule, Brand, Socials],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }

  visible: boolean = false;
}
