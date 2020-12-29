import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SignInComponent} from './sign-in/sign-in.component';
import {MaterialModule} from '../../material.module';
import {ReactiveFormsModule} from '@angular/forms';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ActionsManagerComponent } from './actions-manager/actions-manager.component';
import {AuthenticationRoutingModule} from './authentication-routing.module';


@NgModule({
  declarations: [SignInComponent, SignUpComponent, ResetPasswordComponent, ActionsManagerComponent],
  exports: [
    SignInComponent
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
  ]
})
export class AuthenticationModule {
}
