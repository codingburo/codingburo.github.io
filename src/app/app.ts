import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { ChatComponent } from './components/chat-component/chat-component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Header, ChatComponent],
})
export class App {}
