import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SignInComponent} from './modules/authentication/sign-in/sign-in.component';
import {SignUpComponent} from './modules/authentication/sign-up/sign-up.component';
import {canActivate, redirectLoggedInTo} from '@angular/fire/auth-guard';
import {ResetPasswordComponent} from './modules/authentication/reset-password/reset-password.component';

const redirectLoggedInToHome = () => redirectLoggedInTo('/');

const routes: Routes = [
  {path: 'sign-in', component: SignInComponent, ...canActivate(redirectLoggedInToHome)},
  {path: 'sign-up', component: SignUpComponent, ...canActivate(redirectLoggedInToHome)},
  {path: 'reset-password', component: ResetPasswordComponent, ...canActivate(redirectLoggedInToHome)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
