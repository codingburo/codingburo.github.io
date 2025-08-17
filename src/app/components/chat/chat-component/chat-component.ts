import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptResponse } from '../prompt-response/prompt-response';
import { HomeCard } from '../home-card/home-card';
import { PromptComposer } from '../prompt-composer/prompt-composer';

@Component({
  selector: 'app-chat-component',
  imports: [PromptResponse, PromptComposer, CommonModule, HomeCard],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
})
export class ChatComponent {
  responseData: PromptResponses[] = [];
  numbers: number[] = Array.from({ length: 1 }, (_, i) => i + 1);

  handleResponsesData(data: PromptResponses[]) {
    this.responseData = data;
  }
}
