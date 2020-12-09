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

  successSnack(message: string, duration?: number): void {
    this.openSnack(message, duration, SnackTypes.Success);
  }

  errorSnack(message: string, duration?: number): void {
    this.openSnack(message, duration, SnackTypes.Error);
  }

  warningSnack(message: string, duration?: number): void {
    this.openSnack(message, duration, SnackTypes.Warning);
  }

  infoSnack(message: string, duration: number = 2000): void {
    this.openSnack(message, duration, SnackTypes.Info);
  }

  openSnack(message: string, duration: number = 5000, type: SnackTypes): void {
    const data = {
      message,
      type
    };
    this.snackbar.openFromComponent(CustomSnackComponent, {duration, data: JSON.stringify(data)});
  }

  get raw(): MatSnackBar {
    return this.snackbar;
  }
}
