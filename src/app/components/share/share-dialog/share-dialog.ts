// components/share-dialog/share-dialog.ts
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { RadioButton } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { ShareService } from '../../../services/share-service';

@Component({
  selector: 'app-share-dialog',
  imports: [CommonModule, Dialog, Button, RadioButton, FormsModule],
  templateUrl: './share-dialog.html',
  styleUrl: './share-dialog.css',
})
export class ShareDialogComponent {
  @Input() visible = false;
  @Input() chatId!: string;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() shared = new EventEmitter<string>();

  selectedVisibility: 'public' | 'group' = 'public';
  shareUrl = '';
  isLoading = false;
  copySuccess = false;

  private shareService = inject(ShareService);

  async onShare() {
    this.isLoading = true;
    try {
      const token = await this.shareService.createShareToken(
        this.chatId,
        this.selectedVisibility
      );
      this.shareUrl = `${window.location.origin}/shared/${token}`;
      this.shared.emit(this.shareUrl);
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async copyLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.copySuccess = true;
      setTimeout(() => (this.copySuccess = false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }

  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.shareUrl = '';
  }
  reset() {
    this.shareUrl = '';
    this.selectedVisibility = 'public';
  }

  onDone() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.reset();
  }
}
