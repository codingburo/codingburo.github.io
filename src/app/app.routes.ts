import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat-component/chat-component';
import { RegisterComponent } from './components/auth/register-component/register-component';
import { LoginComponent } from './components/auth/login-component/login-component';
import { Notfound } from './components/notfound/notfound';
import { AuthGuardService } from './services/auth-guard-service';
import { LandingPage } from './components/landing-page/landing-page';
import { ResetPassword } from './components/auth/reset-password/reset-password';
import { EmailVerifyGuard } from './services/email-verify-guard';
import { VerifyEmail } from './components/auth/verify-email/verify-email';
import { AdminDashboard } from './components/admin/admin-dashboard/admin-dashboard';
import { NewLandingComponent } from './components/new-landing-component/new-landing-component';
import { adminGuard } from './services/admin-guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    title: 'Cobu - Your AI Brainstorm Buddy | Smart AI Chat Assistant',
    data: {
      description:
        'Start brainstorming with Cobu, your intelligent AI assistant for creative ideas and productive conversations.',
      keywords:
        'AI chat, brainstorm, creative assistant, artificial intelligence',
    },
  },
  {
    path: 'landing',
    component: NewLandingComponent,
    title: 'Cobu - Your AI Brainstorm Buddy | Smart AI Chat Assistant',
    data: {
      description:
        'Start brainstorming with Cobu, your intelligent AI assistant for creative ideas and productive conversations.',
      keywords:
        'AI chat, brainstorm, creative assistant, artificial intelligence',
    },
  },
  {
    path: 'chat',
    component: ChatComponent,
    title: 'AI Driven Brainstorming Session | Cobu',
    canActivate: [AuthGuardService, EmailVerifyGuard],
    data: {
      description:
        'Continue your AI conversation with Cobu in this chat session.',
      keywords: 'AI chat session, conversation, brainstorm',
    },
  },

  {
    path: 'chat/:sessionId',
    component: ChatComponent,
    title: 'Start Your AI Driven Brainstorming Session | Cobu',
    canActivate: [AuthGuardService, EmailVerifyGuard],
    data: {
      description:
        'Continue your AI conversation with Cobu in this chat session.',
      keywords: 'AI chat session, conversation, brainstorm',
    },
  },

  { path: 'signup', component: RegisterComponent, title: 'Sign Up' },
  { path: 'reset-password', component: ResetPassword, title: 'Reset Password' },
  { path: 'verify-email', component: VerifyEmail, title: 'Verify Email' },
  { path: 'signin', component: LoginComponent, title: 'Sign In' },

  {
    path: 'admin',
    component: AdminDashboard,
    title: 'Admin Dashboard',
    canActivate: [adminGuard],
  },

  { path: '**', component: Notfound, title: 'Not Found' },
];

