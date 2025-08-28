import {
  Component,
  EventEmitter,
  inject,
  Injector,
  Input,
  OnChanges,
  OnInit,
  Output,
  runInInjectionContext,
  SimpleChanges,
} from '@angular/core';
import { Textarea } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Weather } from '../../../services/weather';
import { LoadingComponent } from '../../loading-component/loading-component';
import { ChatdbService } from '../../../services/chatdb-service';
import { AuthService } from '../../../services/auth-service';
import { MessageService } from 'primeng/api';
import {
  DEFAULT_PROVIDER,
  Provider,
  PROVIDER_OPTIONS,
} from '../../../constants/app.constants';

@Component({
  selector: 'app-prompt-composer',
  imports: [Textarea, FormsModule, SelectModule, LoadingComponent],
  templateUrl: './prompt-composer.html',
  styleUrl: './prompt-composer.css',
})
export class PromptComposer implements OnInit, OnChanges {
  chatdbService = inject(ChatdbService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  private injector = inject(Injector);
  constructor(private weatherService: Weather) {}
  prompt!: string;
  isLoading: boolean = false;
  prompts: string[] = [];
  @Output() responseData = new EventEmitter<Chat[]>();
  @Output() newChatStarted = new EventEmitter<void>();
  responses: Chat[] = [];
  selectedAction: string = 'chat';
  promptOptions: any[] = [
    { name: 'Chat', value: 'chat', enabled: true },
    { name: 'Weather', value: 'weather', enabled: true },
    { name: 'Books', value: 'book', enabled: false },
  ];
  private currentSessionId: string | undefined = undefined;
  @Input() sessionId: string | undefined;
  selectedProvider: Provider = DEFAULT_PROVIDER;
  providerOptions = PROVIDER_OPTIONS;

  ngOnInit() {
    // Set currentSessionId from input
    this.currentSessionId = this.sessionId;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sessionId']) {
      this.currentSessionId = this.sessionId;
    }
  }

  getPrompt() {
    if (!this.prompt || !this.selectedAction) {
      return;
    }
    switch (this.selectedAction) {
      case 'chat':
        this.getChat();
        break;
      case 'weather':
        this.getWeather();
        break;
      case 'book':
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

    this.weatherService
      .getWeather(this.prompt, this.selectedProvider)
      .subscribe({
        next: (response: string) => {
          // this.responses.push({ prompt: this.prompt, response: response,  });
          const currentUser = this.authService.currentUserSignal();
          if (currentUser?.uid) {
            runInInjectionContext(this.injector, () => {
              this.chatdbService
                .createChat(
                  currentUser.uid,
                  this.prompt,
                  response,
                  this.selectedProvider,
                  this.currentSessionId
                )
                .then(({ docId, sessionId }) => {
                  this.currentSessionId = sessionId;
                  const newChat: Chat = {
                    id: docId,
                    sessionId: sessionId,
                    email: currentUser.uid,
                    prompt: this.prompt,
                    response: response,
                    provider: this.selectedProvider || DEFAULT_PROVIDER,
                    create_at: new Date(),
                  };
                  this.responseData.emit([newChat]);
                  this.prompt = '';
                });
            });
          }
          this.isLoading = false;
          // this.responseData.emit(this.responses);
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
    this.newChatStarted.emit();
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
          this.chatdbService.createSession(currentUser.uid, this.prompt)
        );

    sessionIdPromise.then((sessionId) => {
      this.weatherService
        .getChat(this.prompt, sessionId, this.selectedProvider)
        .subscribe({
          next: (response: string) => {
            // Save to database
            const currentUser = this.authService.currentUserSignal();
            if (currentUser?.uid) {
              runInInjectionContext(this.injector, () => {
                this.chatdbService
                  .createChat(
                    currentUser.uid,
                    this.prompt,
                    response,
                    this.selectedProvider,
                    sessionId // Use the sessionId we got/generated
                  )
                  .then(({ docId, sessionId: returnedSessionId }) => {
                    this.currentSessionId = returnedSessionId;
                    const newChat: Chat = {
                      id: docId,
                      sessionId: returnedSessionId,
                      email: currentUser.uid,
                      prompt: this.prompt,
                      response: response,
                      provider: this.selectedProvider || DEFAULT_PROVIDER,
                      create_at: new Date(),
                    };
                    this.responseData.emit([newChat]);
                    this.prompt = '';
                  })
                  .catch((error) => {
                    console.error('Error saving chat:', error);
                    this.messageService.add({
                      severity: 'error',
                      summary: 'Error',
                      detail: 'Failed to save chat',
                    });
                  });
              });
            }

            this.isLoading = false;
            // this.responseData.emit(this.responses);
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
