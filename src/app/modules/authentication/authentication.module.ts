import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SignInComponent} from './sign-in/sign-in.component';
import {MaterialModule} from '../../material.module';
import {ReactiveFormsModule} from '@angular/forms';
import { SignUpComponent } from './sign-up/sign-up.component';
import {AppRoutingModule} from '../../app-routing.module';
import { ResetPasswordComponent } from './reset-password/reset-password.component';


@NgModule({
  declarations: [SignInComponent, SignUpComponent, ResetPasswordComponent],
  exports: [
    SignInComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AppRoutingModule,
  ]
})
export class AuthenticationModule {
}
