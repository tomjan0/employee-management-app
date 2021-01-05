import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {ScheduleService} from '../services/schedule.service';
import {ActivatedRoute, Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {SnackService} from '../../../core/services/snack.service';
import {getDaysCount, getInitials} from '../../../core/utils/utils';
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
import {DayShort, SimpleStatus} from '../../../core/types/custom.types';
import {FormControl, FormGroup} from '@angular/forms';
import {DayShortNames} from '../../../core/enums/config.enums';
import {AddConfigShiftDialogComponent} from '../../../shared/dialogs/add-config-shift-dialog/add-config-shift-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ScheduleUserEntry} from '../../../models/schedule.model';
import {ConfirmDialogComponent} from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import {GenerateScheduleDialogComponent} from '../generate-schedule-dialog/generate-schedule-dialog.component';

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

  status: SimpleStatus = 'in-progress';

  constructor(public scheduleService: ScheduleService,
              private route: ActivatedRoute,
              private snackService: SnackService,
              private router: Router,
              private matDialog: MatDialog) {
    const monday = new Date();
    monday.setDate(monday.getDate() + (7 - monday.getDay()) % 7);
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(monday.getDate() + i + 1);
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
      this.calculateAllShiftClasses();
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
      this.status = 'not-started';
    } catch (e) {
      this.snackService.errorSnack('Błędny link');
      this.router.navigateByUrl('/schedule/edit');
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  drop(event: CdkDragDrop<any>): void {
    const curr = event.container.data as { userEntry: ScheduleUserEntry, id: number };
    if (event.previousContainer !== event.container) {
      const prev = event.previousContainer.data as { userEntry: ScheduleUserEntry, id: number };
      if (prev.id === curr.id) {
        const id = prev.id;
        if (prev.userEntry && curr.userEntry) { // exchange between members
          const shift = prev.userEntry.shifts[id][event.previousIndex];
          transferArrayItem(prev.userEntry.shifts[id], curr.userEntry.shifts[id], event.previousIndex, event.currentIndex);
          this.scheduleService.calculateUserStats();
          this.calculateShiftClass(shift, curr.userEntry, curr.id);
        } else if (prev.userEntry) { // drop to header
          prev.userEntry.shifts[id].splice(event.previousIndex, 1);
          this.scheduleService.refreshStats();
        } else if (curr.userEntry) { // drop from header
          const cShift = this.possibleShifts[id][event.previousIndex];
          const shift = {start: cShift.start, end: cShift.end};
          curr.userEntry.shifts[id].splice(event.currentIndex, 0, shift);
          this.scheduleService.refreshStats();
          this.calculateShiftClass(shift, curr.userEntry, curr.id);
        }
      }
    } else {
      if (curr.userEntry) {
        moveItemInArray(curr.userEntry.shifts[curr.id], event.previousIndex, event.currentIndex);
      }
    }
  }

  getInitials(base: string): string {
    return getInitials(base);
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
    this.snackService.errorSnack('Wyjątek został dodany');
  }

  removeExceptionShift(exception: ConfigExceptionShift, shift: ConfigShiftModel): void {
    exception.shifts = exception.shifts.filter(s => s !== shift);
    this.scheduleService.loadPossibleShifts();
  }

  getShiftClass(shift: AvailabilityPeriod, userEntry: ScheduleUserEntry, idx: number): string {
    return userEntry.helper.shiftsClasses[idx].get(shift.start + shift.end) || '';
  }

  private calculateAllShiftClasses(): void {
    for (const userEntry of this.scheduleService.schedule) {
      for (const [i, shifts] of userEntry.shifts.entries()) {
        const avb = userEntry.assignee.availabilities[i];
        const shiftClasses = userEntry.helper.shiftsClasses[i];
        for (const shift of shifts) {
          const key = shift.start + shift.end;
          if (!shiftClasses.get(key)) {
            shiftClasses.set(key, this.checkAvailabilityAgainstShift(shift, avb.periods, avb.preferredPeriods));
          }
        }
      }
    }
  }

  private calculateShiftClass(shift: AvailabilityPeriod, userEntry: ScheduleUserEntry, idx: number): void {
    const shiftClasses = userEntry.helper.shiftsClasses[idx];
    const key = shift.start + shift.end;
    if (!shiftClasses.get(key)) {
      const avb = userEntry.assignee.availabilities[idx];
      shiftClasses.set(key, this.checkAvailabilityAgainstShift(shift, avb.periods, avb.preferredPeriods));
    }
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

  calcAvailabilitiesClasses(shift: AvailabilityPeriod, idx: number): void {
    for (const {helper, assignee} of this.scheduleService.schedule) {
      const avb = assignee.availabilities[idx];
      helper.availabilityClasses[idx] = this.checkAvailabilityAgainstShift(shift, avb.periods, avb.preferredPeriods);
    }
  }

  checkAvailabilityAgainstShift(shift: AvailabilityPeriod,
                                periods: AvailabilityPeriod[],
                                preferredPeriods: AvailabilityPeriod[]): 'preferred' | 'available' | 'not-available' {
    const start = shift.start.padStart(5, '0');
    const end = shift.end.padStart(5, '0');
    for (const period of periods) {
      if (start >= period.start.padStart(5, '0') && end <= period.end.padStart(5, '0')) {
        for (const preferredPeriod of preferredPeriods) {
          if (start >= preferredPeriod.start.padStart(5, '0') && end <= preferredPeriod.end.padStart(5, '0')) {
            return 'preferred';
          }
        }
        return 'available';
      }
    }
    return 'not-available';
  }

  clearAvailabilitiesClasses(idx: number): void {
    for (const {helper} of this.scheduleService.schedule) {
      helper.availabilityClasses[idx] = '';
    }
  }

  async generate(): Promise<void> {
    const dialogRef = this.matDialog.open(GenerateScheduleDialogComponent);
    const options: { forceMinimum: boolean; allowUnavailable: boolean } = await dialogRef.afterClosed().toPromise();

    if (options) {
      this.status = 'in-progress';
      const schedule = this.scheduleService.schedule;
      const possibleShifts = this.scheduleService.possibleShifts;

      const shiftsPerDay = possibleShifts.map(shifts => shifts.length);
      const availabilities = [];
      const preferences = [];
      const minEmployees = this.possibleShifts.map(shifts => shifts.map(s => s.minEmployees));
      const maxEmployees = this.possibleShifts.map(shifts => shifts.map(s => s.maxEmployees));

      for (const userEntry of schedule) {
        const userAvailabilities = [];
        const userPreferences = [];
        for (let i = 0; i < possibleShifts.length; i++) {
          const avb = userEntry.assignee.availabilities[i];
          const d = [];
          const p = [];
          for (const possibleShift of possibleShifts[i]) {
            const check = this.checkAvailabilityAgainstShift(possibleShift, avb.periods, avb.preferredPeriods);
            d.push(check === 'preferred' || check === 'available' ? 1 : 0);
            p.push(check === 'preferred' ? 1 : 0);
          }
          userAvailabilities.push(d);
          userPreferences.push(p);
        }
        availabilities.push(userAvailabilities);
        preferences.push(userPreferences);
      }

      const data = {shiftsPerDay, availabilities, preferences, minEmployees, maxEmployees, forceMinimum: options.forceMinimum};

      try {
        const response = await fetch('https://shift-scheduling-rest-api-welosfizjq-ey.a.run.app/api/schedule?data=' + JSON.stringify(data));
        const res = await response.json();
        if (res && res.results) {
          const generatedSchedule = res.results as number[][][];
          for (const [e, employee] of generatedSchedule.entries()) {
            for (const [d, day] of employee.entries()) {
              schedule[e].shifts[d] = [];
              for (const [s, assigned] of day.entries()) {
                if (assigned) {
                  const {start, end} = possibleShifts[d][s];
                  schedule[e].shifts[d].push({start, end});
                }
              }
            }

          }
        }
        this.calculateAllShiftClasses();
        this.scheduleService.refreshStats();
        this.snackService.successSnack('Wygenerowano grafik');
      } catch (e) {
        this.snackService.errorSnack('Nie udało się wygenerować grafiku');
      } finally {
        this.status = 'not-started';
      }
    }
  }

  async save(publish = false): Promise<void> {
    try {
      this.status = 'in-progress';
      await this.scheduleService.saveSchedule(publish);
      this.snackService.successSnack(publish ? 'Opublikowano' : 'Zapisano');
    } catch (e) {
      this.snackService.errorSnack();
    } finally {
      this.status = 'not-started';
    }
  }

  async clear(): Promise<void> {
    const dialogRef = this.matDialog.open(ConfirmDialogComponent, {data: {message: 'Ta operacja spowoduje lokalne usunięcie całego grafiku. Kontynuować?'}});
    const confirm: ConfigShiftDialogModel = await dialogRef.afterClosed().toPromise();

    if (confirm) {
      for (const userEntry of this.scheduleService.schedule) {
        userEntry.shifts = userEntry.shifts.map(() => []);
      }
    }
    this.scheduleService.refreshStats();
  }
}
