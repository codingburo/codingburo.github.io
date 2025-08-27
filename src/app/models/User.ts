import { UserInfo } from '@angular/fire/auth';

interface MyUser {
  uid: string;
  username: string;
  email: string;
  password?: string;
  photoURL?: string;
  loginMethod?: UserInfo[];
}
