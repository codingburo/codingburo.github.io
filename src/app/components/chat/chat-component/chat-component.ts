import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeCard } from '../../home-card/home-card';
import { PromptComposer } from '../prompt-composer/prompt-composer';
import { ChatSessionComponent } from '../chat-session-component/chat-session-component';
import { ActivatedRoute, Router } from '@angular/router';
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
  private router = inject(Router);
  private chatdbService = inject(ChatdbService);
  private authService = inject(AuthService);
  responseData: Chat[] = [];
  sessionData: Session | undefined;
  currentSessionId: string | undefined;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const sessionId = params.get('sessionId');
      if (sessionId) {
        this.currentSessionId = sessionId;
        this.loadSessionChats(sessionId);
      } else {
        this.currentSessionId = undefined;
        this.responseData = []; // Clear for new chat
      }
    });
  }
  handleNewChat() {
    this.responseData = [];
    this.currentSessionId = undefined; // Reset session ID
    this.sessionData = undefined;
  }

  private loadSessionChats(sessionId: string) {
    const currentUser = this.authService.currentUserSignal();
    if (currentUser?.uid) {
      this.chatdbService
        .getChatsByUserSession(currentUser.uid, sessionId)
        .subscribe((result) => {
          if (result) {
            this.responseData = result.chats;
            this.sessionData = result.session;
          } else {
            // Session was deleted, clear data and redirect
            this.responseData = [];
            this.sessionData = undefined;
          }
        });
    }
  }

  handleResponsesData(data: Chat[]) {
    this.responseData = [...this.responseData, ...data];
    if (!this.currentSessionId && data.length > 0) {
      this.currentSessionId = data[0].sessionId;
      this.router.navigate(['/chat', this.currentSessionId]);
    }
  }
}
