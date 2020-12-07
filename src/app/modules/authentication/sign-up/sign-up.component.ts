import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import RegisterFormModel from '../../../shared/models/register-form.model';
import {ProcessingStatuses} from '../AuthEnums';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})

export class SignUpComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6)]);
  confirmPassword = new FormControl('');
  username = new FormControl('');
  organizationName = new FormControl('', [Validators.required]);
  signUpForm = new FormGroup({
    email: this.email,
    password: this.password,
    confirmPassword: this.confirmPassword,
    username: this.username,
    organizationName: this.organizationName
  });
  hide = true;
  processingStatuses = ProcessingStatuses;
  status = this.processingStatuses.NotStarted;

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {
    this.signUpForm.setValidators(this.passwordMatchValidatorFactory(this.password, this.confirmPassword));
  }

  ngOnInit(): void {
  }

  passwordMatchValidatorFactory(passwordControl: FormControl, confirmPasswordControl: FormControl): ValidatorFn {
    return (): any => {
      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({doNotMatch: true});
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('email')) {
      return 'Nieprawidłowy adres e-mail';
    }

    if (field.hasError('minlength')) {
      return `Wymagane co najmniej ${field.getError('minlength').requiredLength} znaków`;
    }

    if (field.hasError('doNotMatch')) {
      return 'Hasła się nie zgadzają';
    }

    if (field.hasError('alreadyExists')) {
      return 'Ten e-mail jest już przypisany do innego konta';
    }

    if (field.hasError('weakPassword')) {
      return 'Hasło zbyt słabe';
    }
    return '';
  }

  async signUp(): Promise<void> {
    if (this.signUpForm.valid) {
      this.status = this.processingStatuses.InProgress;
      try {
        await this.authService.createAccount(this.signUpForm.value as RegisterFormModel);
        this.snackBar.open('Konto utworzone pomyślnie!')._dismissAfter(5000);
        this.status = this.processingStatuses.Succeeded;
        await this.router.navigateByUrl('/');
      } catch (authError) {
        switch (authError.code) {
          case 'auth/email-already-in-use': {
            this.email.setErrors({alreadyExists: true});
            break;
          }
          case 'auth/invalid-email': {
            this.email.setErrors({email: true});
            break;
          }
          case 'auth/weak-password': {
            this.password.setErrors({weakPassword: true});
            break;
          }
          default: {
            this.snackBar.open('Wystąpił błąd')._dismissAfter(5000);
            break;
          }
        }
        this.status = this.processingStatuses.Failed;
      }
    }
  }

  get isInProgress(): boolean {
    return this.status === this.processingStatuses.InProgress;
  }
}

