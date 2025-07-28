import { Component } from '@angular/core';
import { Socials } from './components/socials/socials';
import { PromptComposer } from './components/prompt-composer/prompt-composer';
import { Fluid } from 'primeng/fluid';
import { Brand } from './components/brand/brand';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Socials, PromptComposer, Fluid, Brand],
})
export class App {}
