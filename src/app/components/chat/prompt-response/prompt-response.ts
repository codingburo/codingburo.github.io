import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-prompt-response',
  imports: [CommonModule, AvatarModule],
  templateUrl: './prompt-response.html',
  styleUrl: './prompt-response.css',
})
export class PromptResponse {
  @Input() responses: PromptResponses[] = [];
}



