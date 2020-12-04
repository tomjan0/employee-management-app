import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  signInForm = new FormGroup({email: this.email, password: this.password});
  hide = true;

  ngOnInit(): void {
  }

  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('email')) {
      return 'Nieprawidłowy adres email';
    }

    if (field.hasError('minlength')) {
      return `Wymagane co najmniej ${field.getError('minlength').requiredLength} znaków`;
    }
    return '';
  }

  signIn(): void {
    console.log('sign in');
  }

  resetPasswort(): void {
    console.log('reset password');
  }

  createAccount(): void {
    console.log('create account');
  }

}
