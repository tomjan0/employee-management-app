import {Component, OnDestroy, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {FirebaseActions, ProcessingStatuses} from '../AuthEnums';
import {AuthService} from '../../../core/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-actions-manager',
  templateUrl: './actions-manager.component.html',
  styleUrls: ['./actions-manager.component.scss']
})
export class ActionsManagerComponent implements OnInit, OnDestroy {
  FirebaseActions = FirebaseActions;
  ProcessingStatuses = ProcessingStatuses;

  newPasswordForm: FormGroup;
  passwordHidden = true;

  status = this.ProcessingStatuses.NotStarted;
  private ngUnsubscribe: Subject<boolean> = new Subject();

  mode = '';
  code = '';
  email = '';
  codeChecked = false;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.newPasswordForm = fb.group({
      password: ['', Validators.required, Validators.minLength(6)],
      confirmPassword: ['']
    });
    this.newPasswordForm.setValidators(this.passwordMatchValidatorFactory(
      this.controls.password as FormControl,
      this.controls.confirmPassword as FormControl));
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async params => {
        this.status = this.ProcessingStatuses.InProgress;

        if (!params) {
          this.wrongLink();
        }
        this.mode = params.mode;
        this.code = params.oobCode;

        switch (this.mode) {
          case FirebaseActions.ResetPassword: {
            try {
              this.email = await this.authService.verifyPasswordResetCode(this.code);
              this.codeChecked = true;
              this.status = this.ProcessingStatuses.NotStarted;
            } catch (codeError) {
              this.wrongLink();
            }
            break;
          }
          case FirebaseActions.VerifyEmail: {
            try {
              await this.authService.verifyEmail(this.code);
              this.status = this.ProcessingStatuses.Succeeded;
            } catch (codeError) {
              this.wrongLink();
            }
            break;
          }
          default: {
            this.wrongLink();
            break;
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  wrongLink(): void {
    this.status = ProcessingStatuses.Succeeded;
    this.snackBar.open('Niepoprawny link.')._dismissAfter(5000);
    // this.router.navigate(['..'], {relativeTo: this.route});
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

  getErrorMessage(field: AbstractControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('minlength')) {
      return `Wymagane co najmniej ${field.getError('minlength').requiredLength} znaków`;
    }

    if (field.hasError('doNotMatch')) {
      return 'Hasła się nie zgadzają';
    }

    if (field.hasError('weakPassword')) {
      return 'Hasło zbyt słabe';
    }
    return '';
  }

  async setPassword(): Promise<void> {
    if (this.newPasswordForm.valid) {
      this.status = this.ProcessingStatuses.InProgress;
      try {
        await this.authService.setNewPassword(this.code, this.newPasswordForm.controls.password.value);
        this.status = this.ProcessingStatuses.Succeeded;
        this.snackBar.open('Hasło zmienione pomyślnie!')._dismissAfter(5000);
        await this.router.navigate(['..', 'sign-in'], {relativeTo: this.route});
      } catch (authError) {
        console.log(authError);
        switch (authError.code) {
          case 'auth/weak-password': {
            this.controls.password.setErrors({weakPassword: true});
            break;
          }
          default: {
            this.snackBar.open('Wystąpił błąd')._dismissAfter(5000);
            break;
          }
        }
        this.status = this.ProcessingStatuses.Failed;
      }
    }
  }

  get controls(): { [p: string]: AbstractControl } {
    return this.newPasswordForm.controls;
  }

  get isInProgress(): boolean {
    return this.status === this.ProcessingStatuses.InProgress;
  }
}
