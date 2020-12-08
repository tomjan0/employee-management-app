import {Component, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatDatepicker} from '@angular/material/datepicker';
import {MatChipList} from '@angular/material/chips';

@Component({
  selector: 'app-availability-edit',
  templateUrl: './availability-edit.component.html',
  styleUrls: ['./availability-edit.component.scss']
})
export class AvailabilityEditComponent implements OnInit {
  date = new FormControl();
  // dayCount = 0;
  days: Date[] = [];
  // form: FormGroup;
  options: string[] = ['Rano', 'Między', 'Wieczór'];

  constructor() {
  }


  ngOnInit(): void {
    const date = new Date();
    this.date.setValue(date);
    this.updateDays();
  }

  getDaysCount(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  chosenYearHandler(date: Date): void {
    const currentValue = this.date.value as Date;
    currentValue.setFullYear(date.getFullYear());
    this.date.setValue(currentValue);
  }

  chosenMonthHandler(date: Date, datepicker: MatDatepicker<Date>): void {
    const currentValue = this.date.value as Date;
    currentValue.setMonth(date.getMonth());
    this.date.setValue(currentValue);
    datepicker.close();
    this.updateDays();
  }

  updateDays(): void {
    const date = this.date.value as Date;
    const dayCount = this.getDaysCount(date.getFullYear(), date.getMonth());
    this.days = Array.from(Array(dayCount).keys()).map(day => {
      const tmp = new Date(date);
      tmp.setDate(day + 1);
      return tmp;
    });
  }



}
