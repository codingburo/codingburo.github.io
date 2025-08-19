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
        return updateProfile(response.user, { displayName: username });
      })
      .catch((err) => {
        console.log('Error While User Sign Up');
        throw err;
      });
    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    return runInInjectionContext(this.injector, () => {
      const promise = signInWithEmailAndPassword(
        this.firebaseAuth,
        email,
        password
      ).then(() => {});
      return from(promise);
    });
  }

  logout(): Observable<void> {
    console.log('Logout called');
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
}
