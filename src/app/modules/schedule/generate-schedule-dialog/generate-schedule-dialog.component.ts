import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-generate-schedule-dialog',
  templateUrl: './generate-schedule-dialog.component.html',
  styleUrls: ['./generate-schedule-dialog.component.scss']
})
export class GenerateScheduleDialogComponent implements OnInit {
  forceMinimum = new FormControl(false);
  forceHours = new FormControl(false);

  constructor() {
  }

  ngOnInit(): void {
  }

}
