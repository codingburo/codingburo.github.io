import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of, from, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth-service';
import { ChatdbService } from '../../../services/chatdb-service';
import { ChatService } from '../../../services/chat-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Fluid } from 'primeng/fluid';

import {
  getProviderIcon,
  DEFAULT_PROVIDER,
} from '../../../constants/app.constants';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-chat-session-component',
  imports: [Button, Fluid, MarkdownComponent],
  templateUrl: './chat-session-component.html',
  styleUrl: './chat-session-component.css',
})
export class ChatSessionComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  chatdbService = inject(ChatdbService);
  chatService = inject(ChatService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService); // Add this
  private destroy$ = new Subject<void>();
  @Input() responses: Chat[] = [];
  router = inject(Router);

  getProviderIcon(provider: string | null | undefined): string {
    return getProviderIcon(provider);
  }

  ngOnInit() {
    // Only load from route if no responses passed as input
    if (this.responses.length === 0) {
      this.route.paramMap
        .pipe(
          switchMap((params) => {
            const chatId = params.get('id');
            if (chatId) {
              const currentUser = this.authService.currentUserSignal();
              if (currentUser?.uid) {
                return this.chatdbService.getChatsByUserSession(
                  currentUser?.uid,
                  Number(chatId)
                );
              }
            }
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((chats) => {
          this.responses = chats || [];
        });
    }
  }
  stringify(obj: any) {
    return JSON.stringify(obj);
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
    if (currentUser?.uid) {
      return from(this.chatdbService.deleteSession(currentUser.uid, sessionId))
        .pipe(
          switchMap(() =>
            this.chatdbService.getUserSessionsList(currentUser.uid)
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
    if (currentUser?.uid) {
      return from(this.chatdbService.deleteChat(chatId))
        .pipe(
          switchMap(() => {
            const sessionId = this.responses?.[0]?.sessionId;
            if (sessionId) {
              return this.chatdbService.getChatsByUserSession(
                currentUser.uid,
                sessionId
              );
            }
            return of(null);
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((chats) => {
          this.responses = chats || [];
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
