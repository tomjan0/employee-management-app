import {Injectable} from '@angular/core';
import RegisterFormModel from '../../shared/models/register-form.model';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {SnackService} from './snack.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user;
  displayName = '';

  constructor(private fireAuth: AngularFireAuth,
              private firestore: AngularFirestore,
              private router: Router,
              private snackService: SnackService) {
    fireAuth.useDeviceLanguage();
    this.user = fireAuth.user;
    this.user.subscribe(user => {
      this.displayName = user
        ? user.displayName
          ? user.displayName
          : user.email
            ? user.email
            : 'Użytkownik'
        : '';
    });
  }

  async createAccount(registerForm: RegisterFormModel): Promise<void> {
    try {
      const credentials = await this.fireAuth.createUserWithEmailAndPassword(registerForm.email, registerForm.password);
      if (registerForm.username) {
        await credentials.user?.updateProfile({displayName: registerForm.username});
        this.displayName = registerForm.username;
      }
      const uid = credentials.user?.uid;
      const organizationDocument = await this.firestore.collection('organizations').add({
        name: registerForm.organizationName,
        owner: uid,
        members: [],
      });
      const userDocument = this.firestore.collection('users').doc(uid);
      await userDocument.set({
        // username: registerForm.username,
        organizations: [organizationDocument.id]
      });
      credentials.user?.sendEmailVerification();
    } catch (authError) {
      throw authError;
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await this.fireAuth.signInWithEmailAndPassword(email, password);
    } catch (authError) {
      throw authError;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.fireAuth.sendPasswordResetEmail(email);
    } catch (authError) {
      throw authError;
    }
  }

  async verifyPasswordResetCode(code: string): Promise<string> {
    try {
      return await this.fireAuth.verifyPasswordResetCode(code);
    } catch (codeError) {
      throw codeError;
    }
  }

  async setNewPassword(code: string, password: string): Promise<void> {
    try {
      await this.fireAuth.confirmPasswordReset(code, password);
    } catch (passwordResetError) {
      throw passwordResetError;
    }
  }

  async verifyEmail(code: string): Promise<void> {
    try {
      await this.fireAuth.applyActionCode(code);
    } catch (codeError) {
      throw codeError;
    }
  }

  async signOut(): Promise<void> {
    await this.fireAuth.signOut();
    await this.router.navigate(['/']);
    this.snackService.successSnack('Wylogowano pomyślnie!');
  }
}
