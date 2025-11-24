import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-tab-menu-component',
  imports: [TabsModule, RouterLink],
  templateUrl: './tab-menu-component.html',
  styleUrl: './tab-menu-component.css',
})
export class TabMenuComponent {
  tabs = [{ route: 'cobu', label: 'New Session', icon: 'pi pi-plus' }];
}
