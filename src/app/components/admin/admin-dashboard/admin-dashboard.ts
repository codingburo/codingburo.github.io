import { Component, inject } from '@angular/core';
import { Button } from "primeng/button";
import { ChatdbService } from '../../../services/chatdb-service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Button],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  chatdbService = inject(ChatdbService);
  confirmationService = inject(ConfirmationService);
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
}
