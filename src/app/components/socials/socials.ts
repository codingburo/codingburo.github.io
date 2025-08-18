import { Component } from '@angular/core';
import { APP_CONFIG } from '../../constants/app.constants';

@Component({
  selector: 'app-socials',
  imports: [],
  templateUrl: './socials.html',
  styleUrl: './socials.css',
})
export class Socials {
  sbaweb_link = `${APP_CONFIG.SBAWEB_LINK}`;
}
