import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { AuthService } from '../../../services/auth-service';
import { ChatdbService } from '../../../services/chatdb-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat-session-component',
  imports: [RouterLink],
  templateUrl: './chat-session-component.html',
  styleUrl: './chat-session-component.css',
})
export class ChatSessionComponent implements OnInit {
  route = inject(ActivatedRoute);
  chatdbService = inject(ChatdbService);
  authService = inject(AuthService);
  chats: Chat[] | null = null;

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const chatId = params.get('id');
          if (chatId) {
            const currentUser = this.authService.currentUserSignal();
            if (currentUser?.email) {
              return this.chatdbService.getChatsByUserSession(
                currentUser?.email,
                Number(chatId)
              );
            }
          }
          return of(null);
        })
      )
      .subscribe((chats) => {
        this.chats = chats;
      });
  }
}
