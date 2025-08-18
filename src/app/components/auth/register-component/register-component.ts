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
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    Toast,
    MessageModule,
    RouterLink,
    Brand
],
  providers: [MessageService],
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
            this.router.navigateByUrl('/signin');
          },
          error: (err) => {
            this.errorMessage = err.message;
          },
        });

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'User Successfully Signed Up',
        life: 3000,
      });
      this.exampleForm.reset();
      this.formSubmitted = false;
    }
  }

  isInvalid(controlName: string) {
    const control = this.exampleForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }
}
