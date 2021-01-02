import {Component, OnInit} from '@angular/core';
import {ScheduleService} from '../services/schedule.service';
import {ActivatedRoute, Router} from '@angular/router';
import {SnackService} from '../../../core/services/snack.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {getDaysCount, getInitials} from '../../../core/utils/utils';
import {SimpleStatus} from '../../../core/types/custom.types';
import {AvailabilityPeriod} from '../../../models/availabilities-data.model';
import {ScheduleUserEntry} from '../../../models/schedule.model';

@Component({
  selector: 'app-schedule-view',
  templateUrl: './schedule-view.component.html',
  styleUrls: ['./schedule-view.component.scss']
})
export class ScheduleViewComponent implements OnInit {
  private readonly ngUnsubscribe = new Subject<boolean>();
  daysNamesArray: Date[] = [];
  month?: number;
  year?: number;
  date = new Date();
  headerDates: Date[] = [];
  scheduleDisplayedColumns: string[] = [];
  status: SimpleStatus = 'in-progress';
  hideNames = false;

  constructor(public scheduleService: ScheduleService,
              private route: ActivatedRoute,
              private snackService: SnackService,
              private router: Router) {
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
          this.date.setFullYear(this.year);
          this.date.setMonth(this.month);
        } else {
          this.snackService.errorSnack('Błędny link');
          this.router.navigateByUrl('/schedule/edit');
        }
      });
  }

  async loadSchedule(month: number, year: number): Promise<void> {
    try {
      await this.scheduleService.subscribeToSchedule(month, year, true);
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
      this.status = 'not-started';
    } catch (e) {
      this.snackService.errorSnack('Błędny link');
      this.router.navigateByUrl('/schedule/edit');
    }
  }

  getInitials(base: string): string {
    return getInitials(base);
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


}
