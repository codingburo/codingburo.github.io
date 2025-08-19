import { Component, OnInit, inject } from '@angular/core';
import { ChatdbService } from '../../../services/chatdb-service';
import { ChatService } from '../../../services/chat-service';
import { AuthService } from '../../../services/auth-service';
import { RouterLink } from '@angular/router';



@Component({
  selector: 'app-chat-list-component',
  imports: [RouterLink],
  templateUrl: './chat-list-component.html',
  styleUrl: './chat-list-component.css',
})
export class ChatListComponent implements OnInit {
  chatService = inject(ChatService);
  chatdbService = inject(ChatdbService);
  authService = inject(AuthService);
  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (user?.email) {
        
        this.chatdbService
          .getUserSessionsList(user.email)
          .subscribe((chat: Chat[]) => {
            this.chatService.chatSignal.set(chat);
          });
      }
    });
  }
}
