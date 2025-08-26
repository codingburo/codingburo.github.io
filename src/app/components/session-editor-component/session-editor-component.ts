import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ChatdbService } from '../../services/chatdb-service';

@Component({
  selector: 'app-session-editor-component',
  imports: [Dialog, InputText, Button, FormsModule],
  templateUrl: './session-editor-component.html',
  styleUrl: './session-editor-component.css',
})
export class SessionEditorComponent {
  @Input() visible = false;
  @Input() sessionId = '';
  @Input() currentTitle = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() titleUpdated = new EventEmitter<string>();

  editTitle = '';
  chatdbService = inject(ChatdbService);
  messageService = inject(MessageService);

  ngOnChanges() {
    if (this.visible && this.currentTitle) {
      this.editTitle = this.currentTitle;
    }
  }

  onSave() {
    if (!this.editTitle.trim()) return;

    this.chatdbService
      .updateSessionTitle(this.sessionId, this.editTitle.trim())
      .then(() => {
        this.titleUpdated.emit(this.editTitle.trim());
        this.onCancel();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Session title updated',
        });
      })
      .catch(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update title',
        });
      });
  }

  onCancel() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.editTitle = '';
  }
}
