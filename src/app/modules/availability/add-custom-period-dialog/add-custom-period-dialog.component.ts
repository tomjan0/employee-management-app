import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';

@Component({
  selector: 'app-add-custom-period-dialog',
  templateUrl: './add-custom-period-dialog.component.html',
  styleUrls: ['./add-custom-period-dialog.component.scss']
})
export class AddCustomPeriodDialogComponent implements OnInit {
  periodForm: FormGroup;


  constructor() {
    const start = new FormControl('', [Validators.required]);
    const end = new FormControl('', [Validators.required]);
    this.periodForm = new FormGroup({start, end});
    this.periodForm.setValidators([
      this.shiftEndValidatorFactory(start, end),
    ]);
  }


  ngOnInit(): void {
  }

  shiftEndValidatorFactory(start: FormControl, end: FormControl): ValidatorFn {
    return (): any => {
      if (start.value && end.value && end.value <= start.value) {
        end.setErrors({wrongEnd: start.value});
      } else {
        if (end.hasError('wrongEnd')) {
          const {wrongEnd, ...rest} = end.errors as any;
          for (const err in rest) {
            if (rest.hasOwnProperty(err)) {
              end.setErrors(rest);
              return;
            }
          }
          end.setErrors(null);
        }
      }
    };
  }


  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('wrongEnd')) {
      return `Wymagany czas późniejszy niż ${field.getError('wrongEnd')}`;
    }

    return '';
  }

  getControl(name: string): FormControl {
    return this.periodForm.controls[name] as FormControl;
  }

}
