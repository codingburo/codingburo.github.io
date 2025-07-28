import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prompt-response',
  imports: [CommonModule],
  templateUrl: './prompt-response.html',
  styleUrl: './prompt-response.css',
})
export class PromptResponse {
  @Input() responses: PromptResponses[] = [];
}
