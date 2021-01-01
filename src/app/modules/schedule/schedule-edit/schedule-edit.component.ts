import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {ScheduleService} from '../services/schedule.service';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {SnackService} from '../../../core/services/snack.service';
import {getDaysCount} from '../../../core/utils/utils';
import {MatTable} from '@angular/material/table';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {AvailabilityPeriod} from '../../../models/availabilities-data.model';
import {
  ConfigExceptionShift,
  ConfigShiftDialogModel,
  ConfigShiftModel,
  ConfigWithExceptionsModel,
  PeriodicConfigShiftModel
} from '../../../models/config.model';
import {DayShort} from '../../../core/types/custom.types';
import {FormControl, FormGroup} from '@angular/forms';
import {DayShortNames} from '../../../core/enums/config.enums';
import {AddConfigShiftDialogComponent} from '../../../shared/dialogs/add-config-shift-dialog/add-config-shift-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-edit',
  templateUrl: './schedule-edit.component.html',
  styleUrls: ['./schedule-edit.component.scss']
})
export class ScheduleEditComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<boolean>();
  month?: number;
  year?: number;
  date = new Date();

  headerDates: Date[] = [];
  scheduleDisplayedColumns: string[] = [];
  possibleShiftsDisplayedColumns: string[] = [];
  hideNames = false;
  daysShortArray: DayShort[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  @ViewChild(MatTable) matTable?: MatTable<any>;
  configDisplayedColumns = ['name', 'start', 'end', 'minEmployees', 'maxEmployees', 'delete'];
  daysNamesArray: Date[] = [];

  exceptionDate = new FormControl('');
  exceptionForm = new FormGroup({exceptionDate: this.exceptionDate});
  exceptionDateMin = new Date();
  exceptionDateMax = new Date();

  constructor(public scheduleService: ScheduleService,
              private route: ActivatedRoute,
              private snackService: SnackService,
              private router: Router,
              private matDialog: MatDialog) {
    const monday = new Date();
    monday.setDate(monday.getDate() + (7 - monday.getDate()) % 7);
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(monday.getDate() + i);
      this.daysNamesArray.push(date);
    }
  }


  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.month = params.month;
        this.year = params.year;
        if (this.month && this.year) {
          this.month--;
          this.loadSchedule(this.month, this.year);
          this.calcExceptionDateMin();
          this.calcExceptionDateMax();
          this.date.setFullYear(this.year);
          this.date.setMonth(this.month);
        } else {
          this.snackService.errorSnack('Błędny link');
          this.router.navigateByUrl('/schedule/edit');
        }
      });
  }

  get possibleShifts(): PeriodicConfigShiftModel[][] {
    return this.scheduleService.possibleShifts;
  }

  async loadSchedule(month: number, year: number): Promise<void> {
    try {
      await this.scheduleService.subscribeToSchedule(month, year);

      const date = new Date();
      date.setMonth(month);
      date.setFullYear(year);
      const dayCount = getDaysCount(year, month);
      this.headerDates = [];
      this.scheduleDisplayedColumns = ['name'];
      for (let i = 0; i < dayCount; i++) {
        date.setDate(i + 1);
        this.headerDates.push(new Date(date));
        this.scheduleDisplayedColumns.push(`day-${i}`);
      }
      this.possibleShiftsDisplayedColumns = this.scheduleDisplayedColumns.map(c => 'pos-shifts-' + c);
    } catch (e) {
      console.log(e);
      this.snackService.errorSnack('Błędny link');
      this.router.navigateByUrl('/schedule/edit');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  drop(event: CdkDragDrop<any>): void {
    const curr = event.container.data as { shifts: AvailabilityPeriod[][], id: number };
    if (event.previousContainer !== event.container) {
      const prev = event.previousContainer.data as { shifts: AvailabilityPeriod[][], id: number };
      if (prev.id === curr.id) {
        const id = prev.id;
        if (prev.shifts && curr.shifts) {
          transferArrayItem(prev.shifts[id], curr.shifts[id], event.previousIndex, event.currentIndex);
          this.scheduleService.calculateUserStats();
        } else if (prev.shifts) {
          prev.shifts[id].splice(event.previousIndex, 1);
          this.scheduleService.refreshStats();
        } else if (curr.shifts) {
          const cShift = this.possibleShifts[id][event.previousIndex];
          curr.shifts[id].splice(event.currentIndex, 0, {start: cShift.start, end: cShift.end});
          this.scheduleService.refreshStats();
        }
      }
    } else {
      if (curr.shifts) {
        moveItemInArray(curr.shifts[curr.id], event.previousIndex, event.currentIndex);
      }
    }
  }

  getInitials(base: string): string {
    return base.split(' ').map(s => s.slice(0, 1)).join('');
  }


  removeShift(day: DayShort, shift: ConfigShiftModel): void {
    this.scheduleService.config[day] = this.scheduleService.config[day].filter(s => s !== shift);
    this.scheduleService.loadPossibleShifts();
  }

  async getShiftFromDialog(): Promise<ConfigShiftModel | undefined> {
    const dialogRef = this.matDialog.open(AddConfigShiftDialogComponent);
    const res: ConfigShiftDialogModel = await dialogRef.afterClosed().toPromise();

    if (res) {
      const start = res.start.split(':').map(s => Number(s));
      const end = res.end.split(':').map(s => Number(s));
      const startDate = new Date();
      startDate.setHours(start[0], start[1]);
      const endDate = new Date();
      endDate.setHours(end[0], end[1]);

      return {
        end: endDate,
        maxEmployees: res.maxEmployees,
        minEmployees: res.minEmployees,
        start: startDate,
        name: res.name || 'Zmiana'
      };
    }
    return undefined;
  }

  async addShift(day: DayShort): Promise<void> {
    const shift = await this.getShiftFromDialog();
    if (shift) {
      this.scheduleService.config[day] = this.scheduleService.config[day].concat(shift);
      this.scheduleService.loadPossibleShifts();
    }
  }

  copyShifts(day: DayShort): void {
    const shifts = this.scheduleService.config[day];
    for (const d of this.daysShortArray) {
      if (d !== day) {
        this.scheduleService.config[d] = this.scheduleService.config[d].concat(shifts);
      }
    }
    this.scheduleService.loadPossibleShifts();
  }

  overwriteShifts(day: DayShort): void {
    const shifts = this.scheduleService.config[day];
    for (const d of this.daysShortArray) {
      if (d !== day) {
        this.scheduleService.config[d] = [...shifts];
      }
    }
    this.scheduleService.loadPossibleShifts();
  }

  get copyInProgress(): boolean {
    return false;
  }


  calcExceptionDateMin(): void {
    const min = this.exceptionDateMin;
    min.setFullYear(this.year as number);
    min.setDate(1);
    min.setMonth(this.month as number);
  }

  calcExceptionDateMax(): void {
    const max = this.exceptionDateMax;
    max.setFullYear(this.year as number);
    max.setDate(1);
    max.setMonth(this.month as number + 1);
    max.setDate(0);
  }

  getClass(exception: ConfigExceptionShift): string {
    return DayShortNames[exception.date.getDay()];
  }

  get exceptions(): ConfigExceptionShift[] {
    return this.scheduleService.config.exceptions;
  }

  get config(): ConfigWithExceptionsModel {
    return this.scheduleService.config;
  }

  addException(): void {
    const date: Date = this.exceptionDate.value;

    const insertId = this.exceptions.findIndex(ex => ex.date.getDate() >= date.getDate());
    if (this.exceptions[insertId]?.date.getDate() === date.getDate()) {
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

  removeExceptionShift(exception: ConfigExceptionShift, shift: ConfigShiftModel): void {
    exception.shifts = exception.shifts.filter(s => s !== shift);
    this.scheduleService.loadPossibleShifts();
  }

  async addExceptionShift(exception: ConfigExceptionShift): Promise<void> {
    const shift = await this.getShiftFromDialog();
    if (shift) {
      exception.shifts = exception.shifts.concat(shift);
      this.scheduleService.loadPossibleShifts();
    }
  }

  removeException(exception: ConfigExceptionShift): void {
    this.config.exceptions = this.config.exceptions.filter(e => e !== exception);
    this.scheduleService.loadPossibleShifts();
  }

  calcClasses(shift: AvailabilityPeriod, idx: number): void {
    for (const {helper, assignee} of this.scheduleService.schedule) {
      const avb = assignee.availabilities[idx];
      helper.availabilityClasses[idx] = this.checkAvailabilityAgainstShift(shift, avb.periods, avb.preferredPeriods);
    }
  }

  checkAvailabilityAgainstShift(shift: AvailabilityPeriod, periods: AvailabilityPeriod[], preferredPeriods: AvailabilityPeriod[]): string {
    for (const period of periods) {
      if (shift.start >= period.start && shift.end <= period.end) {
        for (const preferredPeriod of preferredPeriods) {
          if (shift.start >= preferredPeriod.start && shift.end <= preferredPeriod.end) {
            return 'preferred';
          }
        }
        return 'available';
      }
    }
    return 'not-available';
  }

  clearClasses(idx: number): void {
    for (const {helper} of this.scheduleService.schedule) {
      helper.availabilityClasses[idx] = '';
    }
  }
}
