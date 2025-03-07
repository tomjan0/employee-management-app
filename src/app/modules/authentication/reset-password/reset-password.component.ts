import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProcessingStatuses} from '../../../core/enums/AuthEnums';
import {AuthService} from '../../../core/services/auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SnackService} from '../../../core/services/snack.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  email = new FormControl('', [Validators.required, Validators.email]);
  resetPasswordForm = new FormGroup({email: this.email});
  hide = true;
  processingStatuses = ProcessingStatuses;
  status = this.processingStatuses.NotStarted;
  private ngUnsubscribe: Subject<boolean> = new Subject();


  constructor(
    private authService: AuthService,
    private snackService: SnackService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
      if (params.email) {
        this.email.setValue(params.email);
      }
    });

  }

  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('email')) {
      return 'Nieprawidłowy adres e-mail';
    }

    if (field.hasError('wrongEmail')) {
      return 'Użytkownik o takim adresie e-mail nie istnieje';
    }

    return '';
  }

  async resetPassword(): Promise<void> {
    if (this.resetPasswordForm.valid) {
      try {
        await this.authService.resetPassword(this.resetPasswordForm.value.email);
        this.status = this.processingStatuses.Succeeded;
        this.snackService.successSnack('Link do zresetowania hasła został wysłany na podany adres email.');
        await this.router.navigate(['..', 'sign-in'], {relativeTo: this.route});
      } catch (authError) {
        switch (authError.code) {
          case 'auth/invalid-email': {
            this.email.setErrors({email: true});
            break;
          }
          case 'auth/user-not-found': {
            this.email.setErrors({wrongEmail: true});
            break;
          }
          default: {
            this.snackService.errorSnack('Wystąpił błąd');
            break;
          }
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }


}
