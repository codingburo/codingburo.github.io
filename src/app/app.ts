import { Component } from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { Header } from './components/header/header';
import { ChatComponent } from './components/chat-component/chat-component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Fluid, Header, ChatComponent],
})
export class App {}
