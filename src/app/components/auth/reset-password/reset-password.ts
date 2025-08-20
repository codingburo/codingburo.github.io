import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth-service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Brand } from "../../brand/brand";
import { Message } from "primeng/message";
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    RouterLink,
    Brand,
    Message,
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  messageService = inject(MessageService);
  authService = inject(AuthService);
  errorMessage: string | null = null;
  exampleForm: FormGroup;
  formSubmitted = false;

  constructor(private fb: FormBuilder) {
    this.exampleForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async resetPassword() {
    this.formSubmitted = true;
    const rawForm = this.exampleForm.getRawValue();
    if (rawForm.email) {
      try {
        await this.authService.resetPassword(rawForm.email);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password reset email sent!',
        });
      } catch (error) {
        this.errorMessage = 'Reset failed';
      }
    }
  }

  isInvalid(controlName: string) {
    const control = this.exampleForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}
