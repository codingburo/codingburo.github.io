import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideMarkdown } from 'ngx-markdown';

import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptors,
  // withInterceptorsFromDi,
} from '@angular/common/http';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { ConfirmationService, MessageService } from 'primeng/api';

import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideHttpClient(withInterceptorsFromDi()),
    provideHttpClient(withInterceptors([authInterceptor])),

    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMarkdown(),
    MessageService,
    ConfirmationService,
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
