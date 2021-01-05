import {Component, OnDestroy, OnInit} from '@angular/core';
import ConfigModel, {ConfigShiftDialogModel, ConfigShiftModel} from '../../../models/config.model';
import {DayShort} from '../../../core/types/custom.types';
import {FormControl, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {DataService} from '../../../core/services/data.service';
import {SnackService} from '../../../core/services/snack.service';
import {MatDialog} from '@angular/material/dialog';
import {takeUntil} from 'rxjs/operators';
import {AddConfigShiftDialogComponent} from '../../../shared/dialogs/add-config-shift-dialog/add-config-shift-dialog.component';
import {ConfirmDialogComponent} from '../../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-schedule-settings',
  templateUrl: './schedule-settings.component.html',
  styleUrls: ['./schedule-settings.component.scss']
})
export class ScheduleSettingsComponent implements OnInit, OnDestroy {
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
  nameControl = new FormControl('', [Validators.required]);
  ngUnsubscribe = new Subject<boolean>();

  constructor(private dataService: DataService,
              private snackService: SnackService,
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
    this.nameControl.setValue(this.dataService.organizationData?.name);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  async addShift(day: DayShort): Promise<void> {
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
