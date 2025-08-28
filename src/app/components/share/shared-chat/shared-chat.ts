// components/shared-chat/shared-chat.ts
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { DatePipe } from '@angular/common';
import { ChatActionsComponent } from '../../chat/chat-actions/chat-actions';
import { ShareService } from '../../../services/share-service';
import { AuthService } from '../../../services/auth-service';


@Component({
  selector: 'app-shared-chat',
  imports: [CommonModule, MarkdownComponent, DatePipe, ChatActionsComponent],
  templateUrl: './shared-chat.html',
  styleUrl: './shared-chat.css',
})
export class SharedChatComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shareService = inject(ShareService);
  private authService = inject(AuthService);

  chat: Chat | null = null;
  loading = true;
  isAuthenticated = false;
  ownerEmail = '';

  async ngOnInit() {
    this.isAuthenticated = !!this.authService.currentUserSignal()?.uid;
    const token = this.route.snapshot.paramMap.get('token');
    if (!token) {
      this.loading = false;
      return;
    }

    try {
      this.shareService.getSharedChat(token).then((result)=>{
        this.chat = result.chat;
        this.ownerEmail = result.ownerEmail;
      })
      
      // Track view
      await this.shareService.trackView(token);
    } catch (error) {
      console.error('Failed to load shared chat:', error);
    } finally {
      this.loading = false;
    }
  }

  onInteractionUpdated(chat: Chat) {
    this.chat = { ...this.chat, ...chat };
  }

  signIn() {
    this.router.navigate(['/signin'], {
      queryParams: { returnUrl: this.router.url },
    });
  }
}
