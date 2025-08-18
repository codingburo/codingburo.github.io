import { Component, OnInit } from '@angular/core';
import { AppMenubar } from '../menubar/menubar';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [AppMenubar],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  constructor(private router: Router) {}
  showMenuBar: boolean = true;
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const urlTree = this.router.parseUrl(this.router.url);
        const path =
          urlTree.root.children['primary']?.segments
            .map((s) => s.path)
            .join('/') || '';
        // console.log('Path: ', path);

        this.showMenuBar =
          path !== '' && path !== 'signup' && path !== 'signin';
      });
  }
}
