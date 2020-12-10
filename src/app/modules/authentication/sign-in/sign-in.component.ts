import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {ProcessingStatuses} from '../../../core/enums/AuthEnums';
import {ActivatedRoute, Router} from '@angular/router';
import {SnackService} from '../../../core/services/snack.service';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);
  signInForm = new FormGroup({email: this.email, password: this.password});
  hide = true;
  processingStatuses = ProcessingStatuses;
  status = this.processingStatuses.NotStarted;

  constructor(private authService: AuthService, private snackService: SnackService, private router: Router, private route: ActivatedRoute) {
  }

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

    if (field.hasError('wrongPassword')) {
      return 'Błędne hasło';
    }

    if (field.hasError('wrongEmail')) {
      return 'Użytkownik o takim adresie e-mail nie istnieje';
    }

    // if(field.hasError('accountBlocked')) {
    //   return 'Konto tymczasowo zablokowane';
    // }
    return '';
  }

  async signIn(): Promise<void> {
    if (this.signInForm.valid) {
      try {
        this.status = this.processingStatuses.InProgress;
        await this.authService.signIn(this.signInForm.value.email, this.signInForm.value.password);
        this.snackService.successSnack('Zalogowano pomyślnie!');
        this.status = this.processingStatuses.Succeeded;
        await this.router.navigateByUrl('/');
      } catch (authError) {
        console.log(authError);
        switch (authError.code) {
          case 'auth/wrong-password': {
            this.password.setErrors({wrongPassword: true});
            break;
          }
          case 'auth/user-not-found': {
            this.email.setErrors({wrongEmail: true});
            break;
          }
          case 'auth/too-many-requests': {
            const resetSnack = this.snackService.raw.open('Dostęp do tego konta został zablokowany ze względu na dużą ilość nieudanych prób logowania. Zresetuj hasło, bądź sróbuj ponownie później.', 'Resetuj hasło', {
              duration: 10000,
            });
            resetSnack.onAction().pipe(take(1)).subscribe(() => {
              this.router.navigate(['..', 'reset-password'], {relativeTo: this.route, queryParams: {email: this.email.value}});
            });
            break;
          }
          default: {
            this.snackService.errorSnack('Wystąpił błąd');
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
