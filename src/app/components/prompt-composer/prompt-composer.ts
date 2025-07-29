import { Component, EventEmitter, Output } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { Weather } from '../../services/weather';

@Component({
  selector: 'app-prompt-composer',
  imports: [
    TextareaModule,
    FormsModule,
    FluidModule,
    ButtonModule,
    SelectButtonModule,
  ],
  templateUrl: './prompt-composer.html',
  styleUrl: './prompt-composer.css',
})
export class PromptComposer {
  constructor(private weatherService: Weather) {}
  prompt!: string;
  isLoading: boolean = false;
  prompts: string[] = [];
  @Output() responseData = new EventEmitter<PromptResponses[]>();
  responses: PromptResponses[] = [];
  selectedAction: string = 'weather';
  promptOptions: any[] = [
    { name: 'Get Weather Updates', value: 'weather' },
    // { name: 'Create Image', value: 'image' },
    // { name: 'Write an Email', value: 'email' },
    // { name: 'Research a Topic', value: 'research' },
  ];

  getPrompt() {
    if (!this.prompt || !this.selectedAction) {
      return;
    }
    switch (this.selectedAction) {
      case 'weather':
        this.getWeather();
        break;
      case 'image':
        this.getWeather();
        break;
      case 'email':
        this.getWeather();
        break;
      default:
        this.getWeather();
    }
  }

  getWeather() {
    if (!this.prompt) {
      return;
    }
    this.isLoading = true;
    this.prompt = '';
    this.weatherService
      .getWeather(this.prompt)
      .subscribe((response: string) => {
        this.responses.push({ prompt: this.prompt, response: response });
        this.isLoading = false;

        this.responseData.emit(this.responses);
      });
  }
}
