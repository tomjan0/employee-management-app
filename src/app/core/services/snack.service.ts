import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CustomSnackComponent} from '../snacks/custom-snack/custom-snack.component';
import SnackTypes from '../enums/snack-types.enum';

@Injectable({
  providedIn: 'root'
})
export class SnackService {

  constructor(private snackbar: MatSnackBar) {
  }

  successSnack(message: string, duration: number = 5000): void {
    const data = {
      message,
      type: SnackTypes.Success
    };
    this.snackbar.openFromComponent(CustomSnackComponent, {duration, data: JSON.stringify(data)});
  }

  errorSnack(message: string, duration: number = 5000): void {
    const data = {
      message,
      type: SnackTypes.Error
    };
    this.snackbar.openFromComponent(CustomSnackComponent, {duration, data: JSON.stringify(data)});
  }

  get raw(): MatSnackBar {
    return this.snackbar;
  }
}
