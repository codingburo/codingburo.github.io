import {
  Component,
  inject,
  OnInit,
  runInInjectionContext,
} from '@angular/core';
import { Button } from 'primeng/button';
import { ChatdbService } from '../../../services/chatdb-service';
import { ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-admin-dashboard',
  imports: [Button, DatePipe],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  chatdbService = inject(ChatdbService);
  confirmationService = inject(ConfirmationService);
  orphanedSessions: Session[] = [];

  async ngOnInit(): Promise<void> {
    this.orphanedSessions = await this.chatdbService.findSessionsWithNoChats();
  }
  migrateSessionIds() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to Migrate all Session ids to new?',
      header: 'Migrate Session Ids',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.chatdbService.migrateSessionIds();
      },
    });
  }

  deleteOrphanedSession(sessionId: string) {
    this.confirmationService.confirm({
      message: 'Delete this orphaned session?',
      header: 'Delete Session',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.chatdbService.deleteSessionDocument(sessionId);
        this.orphanedSessions = this.orphanedSessions.filter(
          (s) => s.id !== sessionId
        );
      },
    });
  }
}
