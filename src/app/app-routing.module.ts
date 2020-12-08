import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SignInComponent} from './modules/authentication/sign-in/sign-in.component';
import {SignUpComponent} from './modules/authentication/sign-up/sign-up.component';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {ResetPasswordComponent} from './modules/authentication/reset-password/reset-password.component';
import {ActionsManagerComponent} from './modules/authentication/actions-manager/actions-manager.component';
import {AvailabilityViewComponent} from './modules/availability/availability-view/availability-view.component';
import {AvailabilityEditComponent} from './modules/availability/availability-edit/availability-edit.component';

const redirectLoggedInToHome = () => redirectLoggedInTo('/');
const redirectUnauthorizedToAuth = () => redirectUnauthorizedTo('/auth');

const routes: Routes = [
  // {path: '', pathMatch: 'full', redirectTo: 'auth'},
  {
    path: 'auth', children: [
      {path: '', pathMatch: 'full', redirectTo: 'sign-in'},
      {path: 'sign-in', component: SignInComponent, ...canActivate(redirectLoggedInToHome)},
      {path: 'sign-up', component: SignUpComponent, ...canActivate(redirectLoggedInToHome)},
      {path: 'reset-password', component: ResetPasswordComponent, ...canActivate(redirectLoggedInToHome)},
      {path: 'actions-manager', component: ActionsManagerComponent}]
  },
  {
    path: 'availability', ...canActivate(redirectUnauthorizedToAuth), children: [
      {path: '', pathMatch: 'full', redirectTo: 'show'},
      {path: 'view', component: AvailabilityViewComponent},
      {path: 'edit', component: AvailabilityEditComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
