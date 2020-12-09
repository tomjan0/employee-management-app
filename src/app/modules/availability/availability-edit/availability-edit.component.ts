import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {MatButtonToggleChange} from '@angular/material/button-toggle';
import {take, takeUntil} from 'rxjs/operators';
import {interval, Subject, Subscription} from 'rxjs';
import {SnackService} from '../../../core/services/snack.service';
import {AngularFirestoreDocument} from '@angular/fire/firestore';
import {AvailabilitiesDataModel} from '../../../shared/models/availabilities-data.model';
import firebase from 'firebase/app';
import {MediaMatcher} from '@angular/cdk/layout';
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
  private saveTimeout: Subscription | undefined = undefined;

  private availabilitiesDoc: AngularFirestoreDocument | undefined = undefined;
  private currentSub: Subscription | undefined;
  private saveFires = 0;

  constructor(private dataService: DataService,
              private snackService: SnackService,
              private media: MediaMatcher,
              private changeDetectorRef: ChangeDetectorRef) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnInit(): void {
    const mode = this.dataService.getLocal('availability-view-mode');
    this.viewMode = mode ? mode as ViewMode : 'list';

    this.date = new Date();

    if (this.dataService.dataReady.isStopped) {
      this.refreshData();
    } else {
      this.dataService.dataReady.pipe(take(1)).subscribe(() => {
        this.refreshData();
      });
    }

  }

  get isMobile(): boolean {
    return this.mobileQuery.matches;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
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

  refreshData(): void {
    const month = this.date.getMonth();
    const year = this.date.getFullYear();
    const dayCount = this.getDaysCount(year, month);
    const today = new Date();
    today.setDate(today.getDate() - 1);

    this.data = Array.from(Array(dayCount).keys()).map(day => {
      const tmp = new Date(this.date);
      tmp.setDate(day + 1);
      return {date: tmp, shifts: [], past: tmp < today};
    });

    this.availabilitiesDoc = this.dataService.getAvailabilitiesDoc(month, year);
    this.currentSub?.unsubscribe();
    this.saveFires++;
    this.currentSub = this.availabilitiesDoc?.valueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      if (data) {
        const availabilities = data as AvailabilitiesDataModel;
        for (const pos of availabilities.positions) {
          const day = pos.timestamp.toDate().getDate();
          this.data[day - 1].shifts = pos.shifts;
        }
        console.log(this.saveFires);
        if (this.saveFires === 0) {
          this.snackService.infoSnack('Nastąpiła zewnętrzna zmiana danych');
        }
        if (this.saveFires > 0) {
          this.saveFires--;
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
      this.saveFires += 2;
      await this.availabilitiesDoc?.set({positions: notEmpty} as AvailabilitiesDataModel);
      this.snackService.successSnack('Zapisano!');
    } catch (e) {
      console.error(e);
    }
  }

}
