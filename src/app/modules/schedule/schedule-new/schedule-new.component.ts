import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import ConfigModel, {ConfigExceptionShift, ConfigShiftDialogModel, ConfigShiftModel} from '../../../models/config.model';
import {DayShortNames} from '../../../core/enums/config.enums';
import {DayShort, SimpleStatus} from '../../../core/types/custom.types';
import {AddConfigShiftDialogComponent} from '../../../shared/dialogs/add-config-shift-dialog/add-config-shift-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ScheduleService} from '../services/schedule.service';
import {SnackService} from '../../../core/services/snack.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-schedule-new',
  templateUrl: './schedule-new.component.html',
  styleUrls: ['./schedule-new.component.scss'],
})
export class ScheduleNewComponent implements OnInit {
  private today = new Date();
  private config?: ConfigModel;
  month = new FormControl('', [Validators.required]);
  year = new FormControl(this.currentYear, [Validators.required]);
  exceptionDate = new FormControl('');
  exceptionForm = new FormGroup({exceptionDate: this.exceptionDate});
  exceptions: ConfigExceptionShift[] = [];
  status: SimpleStatus = 'not-started';


  constructor(
    private matDialog: MatDialog,
    private scheduleService: ScheduleService,
    private snackService: SnackService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    this.config = await this.scheduleService.getDefaultConfig();
  }

  get monthOptions(): number[] {
    if (this.year.value) {
      if (this.year.value === this.currentYear) {
        return Array.from(Array(12 - this.currentMonth + 1).keys()).map(i => i + this.currentMonth);
      } else {
        return Array.from(Array(12).keys()).map(i => i + 1);
      }
    }
    return [];
  }

  get currentYear(): number {
    return this.today.getFullYear();
  }

  handleMonthChange(): void {
    if (this.scheduleService.schedules.includes(`${this.month.value}-${this.year.value}`)) {
      this.month.setErrors({alreadyExists: true});
    }
  }

  get currentMonth(): number {
    return this.today.getMonth() + 1;
  }

  get exceptionDateMin(): Date {
    const min = new Date(this.today);
    min.setFullYear(this.year.value);
    min.setMonth(this.month.value - 1);
    min.setDate(1);
    return min;
  }

  get exceptionDateMax(): Date {
    const max = new Date(this.today);
    max.setFullYear(this.year.value);
    max.setMonth(this.month.value);
    max.setDate(0);
    return max;
  }

  async addException(): Promise<void> {
    const date: Date = this.exceptionDate.value;

    const insertId = this.exceptions.findIndex(ex => ex.date.getDate() >= date.getDate());
    if (this.exceptions[insertId]?.date.getDate() === date.getDate()) {
      this.snackService.errorSnack('Wyjątek już dodany');
      return;
    }

    const day: DayShort = DayShortNames[date.getDay()] as DayShort;
    const shifts = [];
    if (this.config) {
      shifts.push(...this.config[day]);
    }

    if (insertId > -1) {
      this.exceptions.splice(insertId, 0, {date, shifts});
    } else {
      this.exceptions.push({date, shifts});
    }
  }

  getClass(exception: ConfigExceptionShift): string {
    return DayShortNames[exception.date.getDay()];
  }

  removeShift(exception: ConfigExceptionShift, shift: ConfigShiftModel): void {
    exception.shifts = exception.shifts.filter(s => s !== shift);

  }

  removeException(exception: ConfigExceptionShift): void {
    this.exceptions = this.exceptions.filter(e => e !== exception);
  }

  async addShift(exception: ConfigExceptionShift): Promise<void> {
    const dialogRef = this.matDialog.open(AddConfigShiftDialogComponent);
    const res: ConfigShiftDialogModel = await dialogRef.afterClosed().toPromise();

    if (res) {
      const start = res.start.split(':').map(s => Number(s));
      const end = res.end.split(':').map(s => Number(s));
      const startDate = new Date();
      startDate.setHours(start[0], start[1]);
      const endDate = new Date();
      endDate.setHours(end[0], end[1]);

      const shift: ConfigShiftModel = {
        end: endDate,
        maxEmployees: res.maxEmployees,
        minEmployees: res.minEmployees,
        start: startDate,
        name: res.name || 'Zmiana'
      };

      exception.shifts = exception.shifts.concat(shift);
    }
  }

  async save(): Promise<void> {
    if (this.config) {
      this.status = 'in-progress';
      try {
        await this.scheduleService.createNewSchedule(this.month.value, this.year.value, this.config, this.exceptions);
        this.snackService.successSnack('Pomyślnie utworzono grafik');
        this.router.navigateByUrl('/schedule/edit');
      } catch (e) {
        this.snackService.errorSnack();
      } finally {
        this.status = 'not-started';
      }
    }
  }
}
