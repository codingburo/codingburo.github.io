import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of, from, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth-service';
import { ChatdbService } from '../../../services/chatdb-service';
import { ChatService } from '../../../services/chat-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { TitleCasePipe } from '@angular/common';
import {
  getProviderIcon,
  DEFAULT_PROVIDER,
} from '../../../constants/app.constants';
import { MarkdownComponent } from 'ngx-markdown';
import { ChatActionsComponent } from '../chat-actions/chat-actions';
import { ChatShareStatusComponent } from '../../chat-share-status/chat-share-status';
import { SessionEditorComponent } from '../session-editor-component/session-editor-component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
@Component({
  selector: 'app-chat-session-component',
  imports: [
    Button,

    MarkdownComponent,
    DatePipe,
    TitleCasePipe,
    SessionEditorComponent,
    ChatActionsComponent,
    ChatShareStatusComponent,
    ScrollPanelModule,
  ],
  templateUrl: './chat-session-component.html',
  styleUrl: './chat-session-component.css',
})
export class ChatSessionComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  chatdbService = inject(ChatdbService);
  chatService = inject(ChatService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();
  @Input() responses: Chat[] = [];
  @Input() sessionData: Session | undefined;

  router = inject(Router);
  showEditDialog = false;

  getProviderIcon(provider: string | null | undefined): string {
    return getProviderIcon(provider);
  }

  ngOnInit() {}
  stringify(obj: any) {
    return JSON.stringify(obj);
  }

  get minCreatedAt(): Date | null {
    if (this.responses.length === 0) return null;
    return new Date(
      Math.min(...this.responses.map((r) => new Date(r.create_at).getTime()))
    );
  }

  get maxCreatedAt(): Date | null {
    if (this.responses.length === 0) return null;
    return new Date(
      Math.max(...this.responses.map((r) => new Date(r.create_at).getTime()))
    );
  }

  confirmDeleteSession(sessionId: string) {
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

  deleteSession(sessionId: string) {
    if (sessionId === '') {
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
        .subscribe((session: Session[]) => {
          this.chatService.sessionSignal.set(session);
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
        .subscribe((result) => {
          if (result && result.chats.length > 0) {
            this.responses = result.chats;
            this.sessionData = result.session;
          } else {
            // Session was deleted, redirect to /chat
            this.router.navigate(['/chat']);
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Chat successfully deleted',
          });
        });
    }
    return null;
  }

  openEditDialog() {
    this.showEditDialog = true;
  }

  onTitleUpdated(newTitle: string) {
    if (this.sessionData) {
      this.sessionData.title = newTitle;
    }
  }

  async onInteractionUpdated(chat: Chat) {
    await this.refreshChatCounts(chat.id);
  }

  private async refreshChatCounts(chatId: string) {
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser?.uid) return;

    // Get updated chat from database
    const updatedChat$ = this.chatdbService.getChatById(chatId);

    updatedChat$.subscribe((updatedChat) => {
      if (updatedChat && updatedChat.interactions) {
        // Find and update the specific chat in responses array
        const chatIndex = this.responses.findIndex((c) => c.id === chatId);
        if (chatIndex >= 0) {
          this.responses[chatIndex].interactions = updatedChat.interactions;
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
