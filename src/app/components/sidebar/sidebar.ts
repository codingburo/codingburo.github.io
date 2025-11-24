import { Component, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Brand } from '../brand/brand';
import { Socials } from '../socials/socials';
import { Drawer } from 'primeng/drawer';
import { ChatListComponent } from '../cobu/chat-list-component/chat-list-component';

@Component({
  selector: 'app-sidebar',
  imports: [Drawer, Button, Brand, Socials, ChatListComponent],
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
