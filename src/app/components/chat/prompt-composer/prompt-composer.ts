import {
  Component,
  EventEmitter,
  inject,
  Injector,
  Output,
  runInInjectionContext,
} from '@angular/core';
import { Textarea } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { Fluid } from 'primeng/fluid';
import { Weather } from '../../../services/weather';
import { LoadingComponent } from '../../loading-component/loading-component';
import { ChatdbService } from '../../../services/chatdb-service';
import { AuthService } from '../../../services/auth-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-prompt-composer',
  imports: [
    Textarea,
    FormsModule,
    Button,
    SelectButton,
    Fluid,
    LoadingComponent,
  ],
  templateUrl: './prompt-composer.html',
  styleUrl: './prompt-composer.css',
})
export class PromptComposer {
  chatdbService = inject(ChatdbService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  private injector = inject(Injector);
  constructor(private weatherService: Weather) {}
  prompt!: string;
  isLoading: boolean = false;
  prompts: string[] = [];
  @Output() responseData = new EventEmitter<PromptResponses[]>();
  responses: PromptResponses[] = [];
  selectedAction: string = 'chat';
  promptOptions: any[] = [
    { name: 'Chat', value: 'chat', enabled: true },
    { name: 'Weather', value: 'weather', enabled: true },
    { name: 'Books', value: 'book', enabled: false },
  ];
  private currentSessionId: number | undefined = undefined;

  getPrompt() {
    if (!this.prompt || !this.selectedAction) {
      return;
    }
    switch (this.selectedAction) {
      case 'weather':
        this.getWeather();
        break;
      case 'maths':
        this.getWeather();
        break;
      case 'book':
        this.getWeather();
        break;
      case 'chat':
        this.getChat();
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

    this.weatherService.getWeather(this.prompt).subscribe({
      next: (response: string) => {
        this.responses.push({ prompt: this.prompt, response: response });
        const currentUser = this.authService.currentUserSignal();
        if (currentUser?.uid) {
          runInInjectionContext(this.injector, () => {
            this.chatdbService
              .createChat(
                currentUser.uid,
                this.prompt,
                response,
                this.currentSessionId
              )
              .then(({ docId, sessionId }) => {
                this.currentSessionId = sessionId;
              });
          });
        }
        this.isLoading = false;
        this.prompt = '';
        this.responseData.emit(this.responses);
      },
      error: (error) => {
        this.isLoading = false;
        let displayMessage = error.message;

        // Parse JSON error message if it's a string
        try {
          const errorObj = JSON.parse(error.message);
          displayMessage = errorObj.error || error.message;
        } catch (e) {
          // If parsing fails, use the original message
          displayMessage = error.message;
        }

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: displayMessage,
          life: 10000,
        });
      },
    });
  }

  // Add method to start new chat
  startNewChat() {
    this.currentSessionId = undefined;
    this.responses = [];
    this.responseData.emit(this.responses);
  }

  getChat() {
    if (!this.prompt) {
      return;
    }
    this.isLoading = true;
    // Get current user first
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser?.uid) {
      this.isLoading = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not authenticated',
      });
      return;
    }

    // Get session ID - use current or get next from chatdb service
    const sessionIdPromise = this.currentSessionId
      ? Promise.resolve(this.currentSessionId)
      : runInInjectionContext(this.injector, () =>
          this.chatdbService.getNextSessionId(currentUser.uid)
        );

    sessionIdPromise.then((sessionId) => {
      this.weatherService.getChat(this.prompt, sessionId).subscribe({
        next: (response: string) => {
          this.responses.push({ prompt: this.prompt, response: response });

          // Save to database
          const currentUser = this.authService.currentUserSignal();
          if (currentUser?.uid) {
            runInInjectionContext(this.injector, () => {
              this.chatdbService
                .createChat(
                  currentUser.uid,
                  this.prompt,
                  response,
                  sessionId // Use the sessionId we got/generated
                )
                .then(({ docId, sessionId: returnedSessionId }) => {
                  this.currentSessionId = returnedSessionId;
                });
            });
          }

          this.isLoading = false;
          this.prompt = '';
          this.responseData.emit(this.responses);
        },
        error: (error) => {
          this.isLoading = false;
          let displayMessage = error.message;
          try {
            const errorObj = JSON.parse(error.message);
            displayMessage = errorObj.error || error.message;
          } catch (e) {
            displayMessage = error.message;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: displayMessage,
          });
        },
      });
    });
  }
}
