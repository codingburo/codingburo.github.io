import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of, from, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth-service';
import { ChatdbService } from '../../../services/chatdb-service';
import { ChatService } from '../../../services/chat-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-chat-session-component',
  imports: [Button],
  templateUrl: './chat-session-component.html',
  styleUrl: './chat-session-component.css',
})
export class ChatSessionComponent implements OnInit {
  route = inject(ActivatedRoute);
  chatdbService = inject(ChatdbService);
  chatService = inject(ChatService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService); // Add this
  private destroy$ = new Subject<void>();

  router = inject(Router);
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
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((chats) => {
        this.chats = chats;
      });
  }

  confirmDeleteSession(sessionId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this entire chat session?',
      header: 'Delete Session',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteSession(sessionId);
      },
    });
  }

  confirmDeleteChat(chatId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this chat?',
      header: 'Delete Chat',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteChat(chatId);
      },
    });
  }

  deleteSession(sessionId: number) {
    if (sessionId === 0) {
      return null;
    }
    const currentUser = this.authService.currentUserSignal();
    if (currentUser?.email) {
      return from(
        this.chatdbService.deleteSession(currentUser.email, sessionId)
      )
        .pipe(
          switchMap(() =>
            this.chatdbService.getUserSessionsList(currentUser.email)
          ),
          takeUntil(this.destroy$)
        )
        .subscribe((chat: Chat[]) => {
          this.chatService.chatSignal.set(chat);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Chat successfully deleted',
          });
          this.router.navigate(['/chat']);
        });
    }
    return null;
  }

  deleteChat(chatId: string) {
    const currentUser = this.authService.currentUserSignal();
    if (currentUser?.email) {
      return from(this.chatdbService.deleteChat(chatId))
        .pipe(
          switchMap(() => {
            const sessionId = this.chats?.[0]?.sessionId;
            if (sessionId) {
              return this.chatdbService.getChatsByUserSession(
                currentUser.email,
                sessionId
              );
            }
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((chats) => {
          this.chats = chats;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Chat successfully deleted',
          });
          // If no chats left in session, redirect to /chat
          if (!chats || chats.length === 0) {
            this.router.navigate(['/chat']);
          }
        });
    }
    return null;
  }
}
