import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeCard } from '../home-card/home-card';
import { PromptComposer } from '../prompt-composer/prompt-composer';
import { ChatSessionComponent } from '../chat-session-component/chat-session-component';
import { ActivatedRoute } from '@angular/router';
import { ChatdbService } from '../../../services/chatdb-service';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-chat-component',
  imports: [PromptComposer, CommonModule, HomeCard, ChatSessionComponent],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
})
export class ChatComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private chatdbService = inject(ChatdbService);
  private authService = inject(AuthService);
  responseData: Chat[] = [];
  currentSessionId: number | undefined;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const sessionId = params.get('sessionId');
      if (sessionId) {
        this.currentSessionId = +sessionId;
        this.loadSessionChats(+sessionId);
      } else {
        this.currentSessionId = undefined;
        this.responseData = []; // Clear for new chat
      }
    });
  }
  handleNewChat() {
    this.responseData = []; // Clear the chat history
    this.currentSessionId = undefined; // Reset session ID
  }

  private loadSessionChats(sessionId: number) {
    const currentUser = this.authService.currentUserSignal();
    if (currentUser?.uid) {
      this.chatdbService
        .getChatsByUserSession(currentUser.uid, sessionId)
        .subscribe((chats) => (this.responseData = chats));
    }
  }

  // handleResponsesData(data: Chat[]) {
  //   this.responseData = data;
  // }

  handleResponsesData(data: Chat[]) {
    this.responseData = [...this.responseData, ...data];
  }
}
