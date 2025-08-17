import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatdbService } from '../../../services/chatdb-service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import {  RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-chat-detail-component',
  imports: [CardModule, ButtonModule, RouterLink],
  templateUrl: './chat-detail-component.html',
  styleUrl: './chat-detail-component.css',
})
export class ChatDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  chatdbService = inject(ChatdbService);
  authService = inject(AuthService);
  chat: Chat | null = null;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const chatId = params.get('id');
          if (chatId) {
            const currentUser = this.authService.currentUserSignal();
            if (currentUser?.email) {
              return this.chatdbService.getChatById(chatId); // Returns Observable<Chat | null>
            }
          }
          return of(null); // ← Return Observable for all other paths
        })
      )
      .subscribe((chat) => {
        // ← Add subscription to execute the pipe
        this.chat = chat;
      });
  }
}
