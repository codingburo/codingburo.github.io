import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  chatSignal = signal<Chat[]>([]);
  sessionSignal = signal<Session[]>([]);
}
