import {
  inject,
  Injectable,
  signal,
  runInInjectionContext,
  Injector,
} from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
  user,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private injector = inject(Injector);
  firebaseAuth = inject(Auth);
  user$;

  constructor() {
    this.user$ = user(this.firebaseAuth);
  }
  currentUserSignal = signal<MyUser | null | undefined>(undefined);

  register(
    email: string,
    password: string,
    username: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    )
      .then((response) => {
        return updateProfile(response.user, { displayName: username })
          .then(() => {
            return sendEmailVerification(response.user);
          })
          .then(() => {
            // Sign out after registration so user must verify email first
            return signOut(this.firebaseAuth);
          });
      })
      .catch((err) => {
        console.log('Error While User Sign Up');
        throw err;
      });
    return from(promise);
  }

  login(
    email: string,
    password: string,
    sendEmailVerification: boolean
  ): Observable<void> {
    return runInInjectionContext(this.injector, () => {
      const promise = signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      ).then((userCredential) => {
        if (!sendEmailVerification) {
          if (!userCredential.user.emailVerified) {
            // Sign out immediately if email not verified
            return signOut(this.firebaseAuth).then(() => {
              throw new Error('Please verify your email before signing in');
            });
          }
        }
        return Promise.resolve();
      });
      return from(promise);
    });
  }

  logout(): Observable<void> {
    return runInInjectionContext(this.injector, () => {
      return from(signOut(this.firebaseAuth));
    });
  }

  signInWithGoogle(): Observable<void> {
    try {
      const provider = new GoogleAuthProvider();
      const promise = signInWithPopup(this.firebaseAuth, provider).then(
        () => {}
      );
      return from(promise);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Add password reset method
  resetPassword(email: string): Observable<void> {
    const promise = sendPasswordResetEmail(this.firebaseAuth, email);
    return from(promise);
  }

  // Add getter for email verification status
  get isEmailVerified(): boolean {
    return this.firebaseAuth.currentUser?.emailVerified || false;
  }

  resendVerificationByEmail(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    )
      .then((userCredential) => {
        if (!userCredential.user.emailVerified) {
          return sendEmailVerification(userCredential.user);
        }
        return Promise.resolve();
      })
      .then(() => {
        return signOut(this.firebaseAuth);
      });
    return from(promise);
  }
}
