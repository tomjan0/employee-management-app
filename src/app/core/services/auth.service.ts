import {Injectable} from '@angular/core';
import RegisterFormModel from '../../shared/models/register-form.model';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user;

  constructor(private fireAuth: AngularFireAuth, private firestore: AngularFirestore) {
    fireAuth.useDeviceLanguage();
    this.user = fireAuth.user;
  }

  async createAccount(registerForm: RegisterFormModel): Promise<void> {
    console.log(registerForm);
    try {
      const credentials = await this.fireAuth.createUserWithEmailAndPassword(registerForm.email, registerForm.password);
      const uid = credentials.user?.uid;
      const organizationDocument = await this.firestore.collection('organizations').add({
        name: registerForm.organizationName,
        owner: uid,
        members: [],
      });
      const userDocument = this.firestore.collection('users').doc(uid);
      await userDocument.set({
        username: registerForm.username,
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
  }
}
