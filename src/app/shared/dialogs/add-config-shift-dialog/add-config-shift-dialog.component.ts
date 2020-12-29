import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SimpleStatus} from '../../../core/types/custom.types';

@Component({
  selector: 'app-add-config-shift-dialog',
  templateUrl: './add-config-shift-dialog.component.html',
  styleUrls: ['./add-config-shift-dialog.component.scss']
})
export class AddConfigShiftDialogComponent implements OnInit {
  shiftForm: FormGroup;
  status: SimpleStatus = 'not-started';

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
    this.shiftForm = fb.group({
      name: ['', [Validators.required]],
      start: [undefined, [Validators.required]],
      end: [undefined, [Validators.required]],
      minEmployees: [0, [Validators.required, Validators.min(0)]],
      maxEmployees: [1, [Validators.required]]
    });

    this.shiftForm.setValidators([
      this.shiftEndValidatorFactory(this.getControl('start'), this.getControl('end')),
      this.maxEmployeesValidatorFactory(this.getControl('minEmployees'), this.getControl('maxEmployees'))
    ]);
  }

  ngOnInit(): void {

  }

  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }

    if (field.hasError('min')) {
      return `Minimum ${field.getError('min').min}`;
    }

    if (field.hasError('maxEmployees')) {
      return `Minimum ${field.getError('maxEmployees')}`;
    }

    if (field.hasError('shiftEnd')) {
      return `Wymagany czas późniejszy niż ${field.getError('shiftEnd')}`;
    }

    return '';
  }

  maxEmployeesValidatorFactory(min: FormControl, max: FormControl): ValidatorFn {
    return (): any => {
      if (max.value < min.value) {
        max.setErrors({maxEmployees: min.value});
      } else {
        max.setErrors(null);
      }
    };
  }

  shiftEndValidatorFactory(start: FormControl, end: FormControl): ValidatorFn {
    return (): any => {
      if (end.value <= start.value) {
        end.setErrors({shiftEnd: start.value});
      } else {
        end.setErrors(null);
      }
    };
  }

  get isInProgress(): boolean {
    return this.status === 'in-progress';
  }

  getControl(name: string): FormControl {
    return this.shiftForm.controls[name] as FormControl;
  }

}
