import {Injectable} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import ConfigModel, {
  ConfigExceptionShift,
  ConfigShiftModel,
  ConfigWithExceptionsModel,
  PeriodicConfigShiftModel
} from '../../../models/config.model';
import {Subject, Subscription} from 'rxjs';
import {SavedSchedule, ScheduleUserEntry} from '../../../models/schedule.model';
import {getDaysCount} from '../../../core/utils/utils';
import firebase from 'firebase';
import {DayShortNames} from '../../../core/enums/config.enums';
import {DayShort} from '../../../core/types/custom.types';
import {formatDate} from '@angular/common';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  firestore: AngularFirestore;
  schedules: string[] = [];
  private schedulesDoc?: AngularFirestoreDocument<{ schedules: string[] }>;
  private scheduleCollection?: AngularFirestoreCollection;
  private currentScheduleSubscription?: Subscription;
  public schedule: ScheduleUserEntry[] = [];
  public possibleShifts: PeriodicConfigShiftModel[][] = [];
  config: ConfigWithExceptionsModel = {exceptions: [], fri: [], mon: [], sat: [], sun: [], thu: [], tue: [], wed: []};
  year = 0;
  month = 0;
  ngUnsubscribe = new Subject<boolean>();


  constructor(private dataService: DataService) {
    this.firestore = this.dataService.getFirestore();
    this.dataService.organizationUnsubscribe.subscribe(() => {
      this.resetSchedules();
      this.loadSchedules();
    });
    this.loadSchedules();
  }

  async loadSchedules(): Promise<void> {
    await this.dataService.waitForOrganizationData();
    if (this.dataService.organizationData) {
      this.schedulesDoc = this.firestore.collection('schedules').doc<{ schedules: string [] }>(this.dataService.organizationData.id);
      this.schedulesDoc.valueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe(next => {
        this.schedules = next?.schedules.sort(this.compareScheduleTitles) || [];
      });
    }
  }

  resetSchedules(): void {
    this.ngUnsubscribe.next(true);
    this.currentScheduleSubscription?.unsubscribe();
    this.currentScheduleSubscription = undefined;

    this.schedules = [];
    this.schedulesDoc = undefined;
    this.scheduleCollection = undefined;
    this.schedule = [];
    this.possibleShifts = [];
    this.config = {exceptions: [], fri: [], mon: [], sat: [], sun: [], thu: [], tue: [], wed: []};
    this.year = 0;
    this.month = 0;
  }

  compareScheduleTitles(a: string, b: string): number {
    const aSplit = a.split('-');
    const bSplit = b.split('-');
    const aNum = Number(aSplit[1] + aSplit[0].padStart(2, '0'));
    const bNum = Number(bSplit[1] + bSplit[0].padStart(2, '0'));
    return bNum - aNum;
  }

  async createNewSchedule(month: number, year: number, config: ConfigModel, exceptions: ConfigExceptionShift[]): Promise<void> {
    if (this.dataService.organizationData) {
      const schedulesDoc = this.firestore.collection('schedules').doc(this.dataService.organizationData.id);
      const doc = await schedulesDoc.get().toPromise();
      const batch = this.firestore.firestore.batch();
      if (!doc.exists) {
        batch.set(schedulesDoc.ref, {schedules: []});
      }
      batch.update(schedulesDoc.ref, {schedules: this.dataService.utils.FieldValue.arrayUnion(`${month}-${year}`)});
      batch.set(schedulesDoc.collection(`${month}-${year}`).doc('config').ref, {...config, exceptions});
      await batch.commit();
    }
  }

  async removeSchedule(scheduleTitle: string): Promise<void> {
    if (this.dataService.organizationData) {
      const batch = this.firestore.firestore.batch();
      const schedulesDoc = this.firestore.collection('schedules').doc(this.dataService.organizationData.id);
      const scheduleCollection = schedulesDoc.collection(scheduleTitle);
      batch.delete(scheduleCollection.doc('config').ref);
      batch.delete(scheduleCollection.doc('working').ref);
      batch.delete(scheduleCollection.doc('public').ref);
      batch.update(schedulesDoc.ref, {schedules: this.dataService.utils.FieldValue.arrayRemove(scheduleTitle)});
      await batch.commit();
    }
  }

  async getDefaultConfig(): Promise<ConfigModel> {
    return await this.dataService.getDefaultConfigOnce();
  }

  async subscribeToSchedule(month: number, year: number, pub = false): Promise<void> {
    await this.dataService.waitForOrganizationData();
    this.currentScheduleSubscription?.unsubscribe();
    const scheduleCollection = await this.schedulesDoc?.collection(`${month + 1}-${year}`).get().toPromise();
    if (!scheduleCollection || scheduleCollection.empty) {
      throw new Error('schedule-does-not-exist');
    } else {
      this.scheduleCollection = this.schedulesDoc?.collection(`${month + 1}-${year}`);
      this.year = year;
      this.month = month;
      this.prepareEmptySchedule(month, year);
      await this.loadAvailabilities();
      await this.loadSchedule(pub);
      this.currentScheduleSubscription = this.schedulesDoc?.collection(`${month + 1}-${year}`)
        .doc<ConfigWithExceptionsModel>('config').valueChanges().subscribe(next => {
          if (next) {
            for (let i = 0; i < 7; i++) {
              const shifts = next[DayShortNames[i] as DayShort];
              for (const shift of (shifts as ConfigShiftModel[])) {
                shift.start = (shift.start as unknown as Timestamp).toDate();
                shift.end = (shift.end as unknown as Timestamp).toDate();
              }
            }
            for (const exception of next.exceptions) {
              exception.date = (exception.date as unknown as Timestamp).toDate();
              const shifts = exception.shifts;
              for (const shift of (shifts as ConfigShiftModel[])) {
                shift.start = (shift.start as unknown as Timestamp).toDate();
                shift.end = (shift.end as unknown as Timestamp).toDate();
              }
            }
          }
          this.config = next || {exceptions: [], fri: [], mon: [], sat: [], sun: [], thu: [], tue: [], wed: []};
          this.loadPossibleShifts(month, year);
          this.refreshStats();
        });
    }
  }

  async loadSchedule(pub: boolean): Promise<void> {
    const data = (await this.scheduleCollection?.doc<SavedSchedule>(pub ? 'public' : 'workingCopy').get().toPromise())?.data();
    if (data) {
      for (const entry of data.entries) {
        const shifts = this.schedule.find(e => e.assignee.userId === entry.assignee)?.shifts;
        if (shifts) {
          for (const {dayNumber, periods} of entry.shifts) {
            shifts[dayNumber] = periods;
          }
        }
      }
      this.refreshStats();
    }
  }


  loadPossibleShifts(month: number = this.month, year: number = this.year): void {
    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month);
    const dayCount = getDaysCount(year, month);

    for (let i = 0; i < dayCount; i++) {
      date.setDate(i + 1);
      const exception = this.config.exceptions.find(e => e.date.getDate() === i + 1);
      const shifts = exception ? exception.shifts : this.config[DayShortNames[date.getDay()] as DayShort];
      this.possibleShifts[i] = shifts.map(s => {
        return {
          start: formatDate(s.start, 'H:mm', 'pl'),
          end: formatDate(s.end, 'H:mm', 'pl'),
          minEmployees: s.minEmployees,
          maxEmployees: s.maxEmployees,
          name: s.name,
          counter: 0
        };
      });
    }
    this.calculateShiftStats();
  }

  async loadAvailabilities(): Promise<void> {
    for (const userEntry of this.schedule) {
      const availabilities = await this.dataService.getAvailabilitiesDataOnce(this.month, this.year, userEntry.assignee.userId);
      for (const pos of availabilities.positions) {
        const day = pos.timestamp.toDate().getDate();
        userEntry.assignee.availabilities[day - 1].periods = pos.periods;
      }
      for (const pos of availabilities.preferredPositions) {
        const day = pos.timestamp.toDate().getDate();
        userEntry.assignee.availabilities[day - 1].preferredPeriods = pos.periods;
      }
    }
  }

  prepareEmptySchedule(month: number, year: number): void {
    const members = this.dataService.mergedMembersInfo;
    const dayCount = getDaysCount(year, month);
    const baseArray = Array.from(Array(dayCount).keys());
    this.schedule = members.map(member => {
      return {
        assignee: {
          ...member,
          availabilities: baseArray.map(() => {
            return {periods: [], preferredPeriods: []};
          }),
          hours: 0
        },
        helper: {
          availabilityClasses: baseArray.map(() => ''),
          shiftsClasses: baseArray.map(() => new Map<string, string>())
        },
        shifts: baseArray.map(() => [])
      };
    });
    this.possibleShifts = baseArray.map(() => []);
  }

  refreshStats(): void {
    this.calculateShiftStats();
    this.calculateUserStats();
  }

  calculateShiftStats(): void {
    for (let i = 0; i < this.possibleShifts.length; i++) {
      for (const posShift of this.possibleShifts[i]) {
        posShift.counter = 0;
      }
      for (const userEntry of this.schedule) { // check every user
        for (const shift of userEntry.shifts[i]) { // check every assigned shift
          for (const posShift of this.possibleShifts[i]) { // check against every possible shift
            if (posShift.start === shift.start && posShift.end === shift.end) {
              posShift.counter++;
            }
          }
        }
      }
    }
  }

  calculateUserStats(): void {
    for (const userEntry of this.schedule) {
      let hours = 0;
      for (const shifts of userEntry.shifts) {
        for (const shift of shifts) {
          const s = shift.start.split(':');
          const e = shift.end.split(':');
          hours += Number(e[0]) + Number(e[1]) / 60 - ((Number(s[0]) + Number(s[1]) / 60));
        }
      }
      userEntry.assignee.hours = Math.round(hours * 100) / 100;
    }
  }

  async saveSchedule(publish = false): Promise<void> {
    const data = [];
    for (const userEntry of this.schedule) {
      const shifts = [];
      for (const [i, periods] of userEntry.shifts.entries()) {
        if (periods.length > 0) {
          shifts.push({dayNumber: i, periods});
        }
      }
      if (shifts.length > 0) {
        data.push({assignee: userEntry.assignee.userId, shifts});
      }
    }
    await this.scheduleCollection?.doc<SavedSchedule>('workingCopy').set({entries: data});
    if (publish) {
      await this.scheduleCollection?.doc<SavedSchedule>('public').set({entries: data});
    }
  }
}
