import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ProcessingStatuses} from '../AuthEnums';
import {AuthService} from '../../../core/services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);
  resetPasswordForm = new FormGroup({email: this.email});
  hide = true;
  processingStatuses = ProcessingStatuses;
  status = this.processingStatuses.NotStarted;


  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {

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
        this.snackBar.open('Link do zresetowania hasła został wysłany na podany adres email.')._dismissAfter(5000);
        await this.router.navigate(['..', 'sign-in'], {relativeTo: this.route});
      } catch (authError) {
        console.log(authError);
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
            this.snackBar.open('Wystąpił błąd')._dismissAfter(5000);
            break;
          }
        }
      }
    }
  }


}
