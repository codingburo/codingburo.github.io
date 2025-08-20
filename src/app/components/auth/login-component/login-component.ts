import { Component, inject, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { Brand } from '../../brand/brand';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-login-component',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    Brand,
    Message,
    Checkbox,
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent implements OnInit {
  messageService = inject(MessageService);
  authService = inject(AuthService);
  router = inject(Router);
  exampleForm: FormGroup;
  formSubmitted = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.exampleForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.required]],
      resendEmail: [false],
    });
  }
  ngOnInit(): void {
    const user = this.authService.currentUserSignal();
    const isAuth = !!user;
    if (isAuth) {
      this.router.navigateByUrl('/chat');
    }
  }

  login() {
    this.formSubmitted = true;
    const rawForm = this.exampleForm.getRawValue();
    if (this.exampleForm.valid) {
      this.authService
        .login(rawForm.email, rawForm.password, rawForm.resendEmail ?? false)
        .subscribe({
          next: () => {
            if (rawForm.resendEmail ?? false) {
              this.authService
                .resendVerificationByEmail(rawForm.email, rawForm.password)
                .subscribe({
                  next: () => {
                    this.messageService.add({
                      severity: 'info',
                      summary: 'Info',
                      detail:
                        'Verification email sent. Please check and confirm',
                    });
                  },
                  error: () => {
                    // Ignore errors for resend
                  },
                });
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User Successfully Logged In',
              life: 3000,
            });
            this.exampleForm.reset();
            this.formSubmitted = false;
            this.router.navigateByUrl('/chat');
          },
          error: (err) => {
            this.errorMessage = err.message;
          },
        });
    }
  }

  isInvalid(controlName: string) {
    const control = this.exampleForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  signInWithGoogle() {
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Successfully signed in with Google',
          life: 3000,
        });
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        this.errorMessage = 'Google sign-in failed';
      },
    });
  }

  signInWithGithub() {
    this.authService.signInWithGithub().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Successfully signed in with GitHub',
          life: 3000,
        });
        this.router.navigate(['/chat']);
      },
      error: (error) => {
        this.errorMessage = 'GitHub sign-in failed';
      },
    });
  }
}
