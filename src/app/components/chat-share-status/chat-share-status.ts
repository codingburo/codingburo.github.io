import { Component, inject, Input, OnInit } from "@angular/core";
import { ShareService } from "../../services/share-service";
import { MessageService } from "primeng/api";


// components/chat-share-status/chat-share-status.ts
@Component({
  selector: 'app-chat-share-status',
  imports: [],
  templateUrl: './chat-share-status.html',
  styleUrl: './chat-share-status.css',
})
export class ChatShareStatusComponent implements OnInit {
  @Input() chat!: Chat;
  private shareService = inject(ShareService);
  messageService = inject(MessageService);
  sharedUrl:string = '';

  shareTokens: any[] = [];

  async ngOnInit() {
    this.shareTokens = await this.shareService.getActiveShareTokens(
      this.chat.id
    );
  }

  async copyShareLink() {
    if (this.shareTokens.length > 0) {
      const token = this.shareTokens[0].token;
      const shareUrl = `${window.location.origin}/shared/${token}`;
      this.sharedUrl = shareUrl;
      await navigator.clipboard.writeText(shareUrl);
      this.messageService.add({
        severity: 'info',
        summary: 'Link Copied',
        detail: 'Copied to Clipboard',
      });
    }
  }

  async stopSharing() {
    await this.shareService.deactivateShareTokens(this.chat.id);
    this.shareTokens = [];
    this.sharedUrl='';
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Link Sharing disabled',
    });
  }
}

