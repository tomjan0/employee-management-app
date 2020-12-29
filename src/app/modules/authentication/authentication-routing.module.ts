import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {SignInComponent} from './sign-in/sign-in.component';
import {canActivate, redirectLoggedInTo} from '@angular/fire/auth-guard';
import {SignUpComponent} from './sign-up/sign-up.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ActionsManagerComponent} from './actions-manager/actions-manager.component';

const redirectLoggedInToHome = () => redirectLoggedInTo('/');

const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'sign-in'},
  {path: 'sign-in', component: SignInComponent, ...canActivate(redirectLoggedInToHome)},
  {path: 'sign-up', component: SignUpComponent, ...canActivate(redirectLoggedInToHome)},
  {path: 'reset-password', component: ResetPasswordComponent, ...canActivate(redirectLoggedInToHome)},
  {path: 'actions-manager', component: ActionsManagerComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {
}
