import { Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../services/auth-service';
import { Router, RouterLink } from '@angular/router';
import { Brand } from "../../brand/brand";

@Component({
  selector: 'app-register-component',
  templateUrl: './register-component.html',
  styleUrl: './register-component.css',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    Toast,
    MessageModule,
    RouterLink,
    Brand,
  ],
})
export class RegisterComponent {
  messageService = inject(MessageService);
  authService = inject(AuthService);
  router = inject(Router);
  exampleForm: FormGroup;
  formSubmitted = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder) {
    this.exampleForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.required]],
    });
  }

  onSubmit() {
    this.formSubmitted = true;
    const rawForm = this.exampleForm.getRawValue();
    if (this.exampleForm.valid) {
      this.authService
        .register(rawForm.email, rawForm.password, rawForm.username)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Verification email sent! Please check your inbox.',
            });
            this.router.navigateByUrl('/signin');
          },
          error: (err) => {
            this.errorMessage = err.message;
          },
        });

      this.exampleForm.reset();
      this.formSubmitted = false;
    }
  }

  isInvalid(controlName: string) {
    const control = this.exampleForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  signUpWithGoogle() {
    this.authService.signInWithGoogle().subscribe({
      next: (result) => {
        const message = result.isNewUser
          ? 'Successfully signed up with Google'
          : 'Successfully signed in with Google - account already exists';

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: message,
          life: 3000,
        });
        this.router.navigate(['/cobu']);
      },
      error: (error) => {
        this.errorMessage = 'Google sign-up failed';
      },
    });
  }

  signUpWithGithub() {
    this.authService.signInWithGithub().subscribe({
      next: (result) => {
        const message = result.isNewUser
          ? 'Successfully signed up with GitHub'
          : 'Successfully signed in with GitHub - account already exists';

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: message,
          life: 3000,
        });
        this.router.navigate(['/cobu']);
      },
      error: (error) => {
        this.errorMessage = 'GitHub sign-up failed';
      },
    });
  }

  signUpWithX() {
    this.authService.signInWithX().subscribe({
      next: (result) => {
        const message = result.isNewUser
          ? 'Successfully signed up with X'
          : 'Successfully signed in with X - account already exists';

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: message,
          life: 3000,
        });
        this.router.navigate(['/cobu']);
      },
      error: (error) => {
        this.errorMessage = 'X sign-up failed';
      },
    });
  }
}
