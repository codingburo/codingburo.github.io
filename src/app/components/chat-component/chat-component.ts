import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromptResponse } from '../prompt-response/prompt-response';
import { HomeCard } from '../home-card/home-card';
import { PromptComposer } from '../prompt-composer/prompt-composer';
import { Fluid } from 'primeng/fluid';

@Component({
  selector: 'app-chat-component',
  imports: [PromptResponse, HomeCard, PromptComposer, Fluid, CommonModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.css',
})
export class ChatComponent {
  responseData: PromptResponses[] = [];

  handleResponsesData(data: PromptResponses[]) {
    this.responseData = data;
  }
}
