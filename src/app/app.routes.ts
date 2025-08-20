import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat-component/chat-component';
import { RegisterComponent } from './components/auth/register-component/register-component';
import { LoginComponent } from './components/auth/login-component/login-component';
import { Notfound } from './components/notfound/notfound';
import { AuthGuardService } from './services/auth-guard-service';
import { ChatDetailComponent } from './components/chat/chat-detail-component/chat-detail-component';
import { ChatSessionComponent } from './components/chat/chat-session-component/chat-session-component';
import { LandingPage } from './components/landing-page/landing-page';
import { ResetPassword } from './components/auth/reset-password/reset-password';
import { EmailVerifyGuard } from './services/email-verify-guard';
import { VerifyEmail } from './components/auth/verify-email/verify-email';

export const routes: Routes = [
  { path: '', component: LandingPage, title: 'Cobu - Smart Chat + Weather' },

  {
    path: 'chat',
    component: ChatComponent,
    title: 'Chat with Cobu',
    canActivate: [AuthGuardService, EmailVerifyGuard],
  },
  {
    path: 'chat/:id', // ← Add route with ID parameter
    component: ChatDetailComponent, // ← Your detail component
    title: 'Chat Detail',
    canActivate: [AuthGuardService],
  },
  {
    path: 'chats/:id',
    component: ChatSessionComponent,
    title: 'User Chat',
    canActivate: [AuthGuardService],
  },
  { path: 'signup', component: RegisterComponent, title: 'Sign Up' },
  { path: 'reset-password', component: ResetPassword, title: 'Reset Password' },
  { path: 'verify-email', component: VerifyEmail, title: 'Verify Email' },

  { path: 'signin', component: LoginComponent, title: 'Sign In' },
  { path: '**', component: Notfound, title: 'Not Found' },
];
//EmailVerifyGuard
