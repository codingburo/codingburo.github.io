// components/chat/chat-actions/chat-actions.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatInteractionsService } from '../../../services/chat-interactions-service';
import { AuthService } from '../../../services/auth-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ShareDialogComponent } from '../../share/share-dialog/share-dialog';

@Component({
  selector: 'app-chat-actions',
  imports: [CommonModule, ShareDialogComponent],
  templateUrl: './chat-actions.html',
})
export class ChatActionsComponent {
  @Input() chat!: Chat;
  @Output() retry = new EventEmitter<string>();
  @Input() readonly = false;
  userReaction: 'like' | 'dislike' | null = null;
  private interactionsService = inject(ChatInteractionsService);
  private auth = inject(AuthService);
  @Output() interactionUpdated = new EventEmitter<Chat>();
  messageService = inject(MessageService);
  showShareDialog = false;
  private router = inject(Router);

  async ngOnInit() {
    await this.loadUserReaction();
  }

  private async loadUserReaction() {
    const userId = this.auth.currentUserSignal()?.uid;
    if (!userId) return;

    this.userReaction = await this.interactionsService.getUserReaction(
      this.chat.id,
      userId
    );
  }

  async onLike() {
    if (this.readonly) {
      this.showSignInPrompt();
      return;
    }
    await this.interactionsService.toggleLike(this.chat.id).then(() => {
      this.loadUserReaction().then(() => {
        this.interactionUpdated.emit(this.chat);
      });
    });
  }

  async onDislike() {
    if (this.readonly) {
      this.showSignInPrompt();
      return;
    }
    await this.interactionsService.toggleDislike(this.chat.id).then(() => {
      // Refresh user reaction after toggle
      this.loadUserReaction().then(() => {
        this.interactionUpdated.emit(this.chat);
      });
    });
  }

  getLikeClass() {
    return this.userReaction === 'like'
      ? 'text-blue-400 font-semibold'
      : 'text-stone-500';
  }

  getDislikeClass() {
    return this.userReaction === 'dislike'
      ? 'text-red-400 font-semibold'
      : 'text-stone-500';
  }

  onCopy() {
    this.interactionsService.copyToClipboard(this.chat.id, this.chat.response);
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Copied to Clipboard',
    });
  }

  onRetry() {
    this.messageService.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Retry will be enabled soon',
    });
    // this.retry.emit(this.chat.prompt);
  }

  onShare() {
    const userId = this.auth.currentUserSignal()?.uid;
    if (!userId) {
      // Show sign-in prompt instead of share dialog
      this.router.navigate(['/signin']);
      return;
    }
    this.showShareDialog = true;
  }

  onShared(shareUrl: string) {
    console.log('Chat shared:', shareUrl);
    // this.showShareDialog = false;
    // Refresh interaction counts
    this.interactionUpdated.emit(this.chat);
  }

  private showSignInPrompt() {
    // Could emit event or show tooltip
    console.log('Sign in required for interactions');
  }
}
