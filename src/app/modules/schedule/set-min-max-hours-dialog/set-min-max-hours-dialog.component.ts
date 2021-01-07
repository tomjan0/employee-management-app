import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-set-min-max-hours-dialog',
  templateUrl: './set-min-max-hours-dialog.component.html',
  styleUrls: ['./set-min-max-hours-dialog.component.scss']
})
export class SetMinMaxHoursDialogComponent implements OnInit {

  hoursForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder) {
    this.hoursForm = fb.group({
      min: [data?.min || '', [Validators.min(0)]],
      max: [data?.max || '', [Validators.min(1)]]
    });
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
    return '';
  }

  getControl(name: string): FormControl {
    return this.hoursForm.controls[name] as FormControl;
  }

  get checkRange(): boolean {
    const min = this.getControl('min').value;
    const max = this.getControl('max').value;
    return min && max ? max < min : false;
  }
}
