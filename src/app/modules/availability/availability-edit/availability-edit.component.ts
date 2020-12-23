import {ChangeDetectorRef, Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {take, takeUntil} from 'rxjs/operators';
import {interval, Subject, Subscription} from 'rxjs';
import {SnackService} from '../../../core/services/snack.service';
import {AngularFirestoreDocument} from '@angular/fire/firestore';
import {AvailabilitiesDataModel} from '../../../models/availabilities-data.model';
import firebase from 'firebase/app';
import {MediaMatcher} from '@angular/cdk/layout';
import {formatDate} from '@angular/common';
import ConfigModel, {ConfigShiftModel} from '../../../models/config.model';
import {DayShort} from '../../../core/types/custom.types';
import Timestamp = firebase.firestore.Timestamp;

type ViewMode = 'list' | 'grid';

interface Position {
  date: Date;
  shifts: number[];
  past: boolean;
}

@Component({
  selector: 'app-availability-edit',
  templateUrl: './availability-edit.component.html',
  styleUrls: ['./availability-edit.component.scss']
})
export class AvailabilityEditComponent implements OnInit, OnDestroy {
  public date: Date = new Date();
  public viewMode: ViewMode = 'list';
  public data: Position[] = [];

  private readonly ngUnsubscribe = new Subject<boolean>();
  private readonly mobileQuery;
  private readonly mobileQueryListener: () => void;

  private saveInterval = interval(1000);
  private saveTimeout: Subscription | undefined;

  private availabilitiesDoc: AngularFirestoreDocument | undefined;
  private currentSub: Subscription | undefined;

  private config: ConfigModel = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  private daysShortArray: DayShort[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  test = [{start: new Date(2020, 12, 1, 15, 0), end: new Date(2020, 12, 1, 22, 0)}, {
    start: new Date(2020, 12, 1, 15, 0),
    end: new Date(2020, 12, 1, 22, 0)
  }, {start: new Date(2020, 12, 1, 15, 0), end: new Date(2020, 12, 1, 22, 0)}];

  constructor(private dataService: DataService,
              private snackService: SnackService,
              private media: MediaMatcher,
              private changeDetectorRef: ChangeDetectorRef,
              @Inject(LOCALE_ID) private locale: string) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  get isMobile(): boolean {
    return this.mobileQuery.matches;
  }

  async loadData(): Promise<void> {
    await this.dataService.waitForOrganizationData();
    this.dataService.defaultConfigDoc?.valueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe(newConfig => {
      if (newConfig) {
        for (const day of this.daysShortArray) {
          this.config[day] = newConfig[day]?.map(shift => {
            shift.start = (shift.start as unknown as Timestamp).toDate();
            shift.end = (shift.end as unknown as Timestamp).toDate();
            return shift;
          });
        }
        this.config = newConfig;
      }
    });

    const mode = this.dataService.getLocal('availability-view-mode');
    this.viewMode = mode ? mode as ViewMode : 'list';

    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);

    this.refreshData();
  }

  getConfigShifts(date: Date): ConfigShiftModel[] {
    const day = (date.getDay() + 6) % 7;
    return this.config ? this.config[this.daysShortArray[day]] : [];
  }


  handleViewModeChange(e: MatButtonToggleChange): void {
    this.viewMode = e.value;
    this.dataService.setLocal('availability-view-mode', this.viewMode);
  }

  handleAvailabilityChange(e: MatButtonToggleChange, id: number): void {
    this.data[id].shifts = e.value as number[];
    this.debounceSave();
  }

  getDaysCount(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getClosestNotPastSunday(date: Date): Date {
    const cp = new Date(date);
    const diff = (7 - date.getDay()) % 7;
    cp.setDate(cp.getDate() + diff);
    if (cp.getMonth() !== date.getMonth()) {
      cp.setDate(0);
    }
    return cp;
  }

  getWeekHeader(date: Date): string {
    const sunday = this.getClosestNotPastSunday(date);
    let res = formatDate(date, 'd MMM', this.locale);
    if (sunday.getDate() !== date.getDate()) {
      res += ' - ' + formatDate(sunday, 'd MMM', this.locale);
    }
    return res;
  }

  refreshData(): void {
    const month = this.date.getMonth();
    const year = this.date.getFullYear();
    const dayCount = this.getDaysCount(year, month);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.data = Array.from(Array(dayCount).keys()).map(day => {
      const tmp = new Date(this.date);
      tmp.setDate(day + 1);
      return {date: tmp, shifts: [], past: tmp < today};
    });

    this.availabilitiesDoc = this.dataService.getAvailabilitiesDoc(month, year);
    this.currentSub?.unsubscribe();
    this.currentSub = this.availabilitiesDoc?.valueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data) {
        const availabilities = data as AvailabilitiesDataModel;
        for (const pos of availabilities.positions) {
          const day = pos.timestamp.toDate().getDate();
          this.data[day - 1].shifts = pos.shifts;
        }
      }
    });
  }

  async changeMonth(diff: 1 | -1): Promise<void> {
    if (this.saveTimeout) {
      this.saveTimeout.unsubscribe();
      this.saveTimeout = undefined;
      await this.save();
    }
    const date = new Date(this.date);
    date.setMonth(date.getMonth() + diff);
    this.date = date;
    this.refreshData();
  }

  nextMonth(): void {
    this.changeMonth(1);
  }

  prevMonth(): void {
    this.changeMonth(-1);
  }

  debounceSave(): void {
    this.saveTimeout?.unsubscribe();
    this.saveTimeout = this.saveInterval.pipe(take(1)).subscribe(() => {
      this.saveTimeout = undefined;
      this.save();
    });
  }

  async save(): Promise<void> {
    const notEmpty = this.data
      .filter(pos => pos.shifts.length > 0)
      .map(pos => {
        return {shifts: pos.shifts, timestamp: Timestamp.fromDate(pos.date)};
      });
    try {
      if (this.availabilitiesDoc) {
        await this.availabilitiesDoc?.set({positions: notEmpty} as AvailabilitiesDataModel);
        this.snackService.successSnack('Zapisano!');
      } else {
        this.snackService.errorSnack('Utracono połączenie');
      }
    } catch (e) {
      this.snackService.errorSnack();
    }
  }

  getAvailability(day: Date): { start: Date; end: Date }[] {
    console.log(day);
    return this.test;
  }

}
