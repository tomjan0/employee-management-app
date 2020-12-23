import {Component, OnDestroy, OnInit} from '@angular/core';
import ConfigModel, {ConfigShiftModel} from '../../../models/config.model';
import {DataService} from '../../../core/services/data.service';
import firebase from 'firebase';
import {Subject} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {AddConfigShiftDialogComponent} from '../add-config-shift-dialog/add-config-shift-dialog.component';
import {DayShort} from '../../../core/types/custom.types';
import {SnackService} from '../../../core/services/snack.service';
import {takeUntil} from 'rxjs/operators';
import Timestamp = firebase.firestore.Timestamp;
import {ConfirmDialogComponent} from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
  styleUrls: ['./organization-settings.component.scss']
})
export class OrganizationSettingsComponent implements OnInit, OnDestroy {
  config: ConfigModel = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  daysShortArray: DayShort[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  daysNamesArray: Date[] = [];
  displayedColumns = ['name', 'start', 'end', 'minEmployees', 'maxEmployees', 'delete'];
  copyInProgress = false;
  ngUnsubscribe = new Subject<boolean>();

  constructor(private dataService: DataService,
              private snackService: SnackService,
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
    this.dataService.defaultConfigDoc?.valueChanges().pipe(takeUntil(this.ngUnsubscribe)).subscribe(newConfig => {
      if (newConfig) {
        for (const day of this.daysShortArray) {
          this.config[day] = newConfig[day]?.map(shift => {
            shift.start = (shift.start as Timestamp).toDate();
            shift.end = (shift.end as Timestamp).toDate();
            return shift;
          });
        }
        this.config = newConfig;
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  async addShift(day: DayShort): Promise<void> {
    const dialogRef = this.matDialog.open(AddConfigShiftDialogComponent);
    const shift: ConfigShiftModel = await dialogRef.afterClosed().toPromise();

    if (shift) {
      const start = (shift.start as unknown as string).split(':').map(s => Number(s));
      const end = (shift.end as unknown as string).split(':').map(s => Number(s));
      const startDate = new Date();
      startDate.setHours(start[0], start[1]);
      const endDate = new Date();
      endDate.setHours(end[0], end[1]);

      shift.start = startDate;
      shift.end = endDate;
      try {
        await this.dataService.addShift(day, shift);
        this.snackService.successSnack('Dodano zmianę');
      } catch (e) {
        this.snackService.errorSnack();
      }
    }
  }

  async removeShift(day: DayShort, shift: ConfigShiftModel): Promise<void> {
    const confirm = await this.matDialog.open(ConfirmDialogComponent).afterClosed().toPromise();
    if (confirm) {
      try {
        await this.dataService.removeShift(day, shift);
        this.snackService.successSnack('Usunięto zmianę');
      } catch (e) {
        console.log(e);
        this.snackService.errorSnack();
      }
    }
  }

  async copyShifts(sourceDay: DayShort): Promise<void> {
    const confirm = await this.matDialog.open(ConfirmDialogComponent).afterClosed().toPromise();
    if (confirm) {
      this.copyInProgress = true;

      const shiftsToCopy = this.config[sourceDay];
      const days = this.daysShortArray.filter(day => day !== sourceDay);

      try {
        await this.dataService.copyShifts(days, shiftsToCopy);
        this.snackService.successSnack('Skopiowano zmiany');
      } catch (e) {
        this.snackService.errorSnack();
      } finally {
        this.copyInProgress = false;
      }
    }
  }

  async overwriteShifts(sourceDay: DayShort): Promise<void> {
    const confirm = await this.matDialog.open(ConfirmDialogComponent).afterClosed().toPromise();
    if (confirm) {
      this.copyInProgress = true;

      const shiftsToCopy = this.config[sourceDay];
      const days = this.daysShortArray.filter(day => day !== sourceDay);

      try {
        await this.dataService.overwriteShifts(days, shiftsToCopy);
        this.snackService.successSnack('Nadpisano zmiany');
      } catch (e) {
        this.snackService.errorSnack();
      } finally {
        this.copyInProgress = false;
      }
    }
  }

}
