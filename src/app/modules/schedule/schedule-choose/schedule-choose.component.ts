import {Component, OnInit} from '@angular/core';
import {ScheduleService} from '../services/schedule.service';
import {SnackService} from '../../../core/services/snack.service';
import {SimpleStatus} from '../../../core/types/custom.types';
import {Router} from '@angular/router';

@Component({
  selector: 'app-schedule-choose',
  templateUrl: './schedule-choose.component.html',
  styleUrls: ['./schedule-choose.component.scss']
})
export class ScheduleChooseComponent implements OnInit {
  status: SimpleStatus = 'in-progress';
  mode: 'edit' | 'view' | '' = '';

  constructor(private scheduleService: ScheduleService,
              private snackService: SnackService,
              private router: Router) {
  }


  ngOnInit(): void {
    this.loadMode();
  }

  async loadMode(): Promise<void> {
    const mode = this.router.url.split('/').pop();
    if (mode === 'edit' || mode === 'view') {
      this.mode = mode;
      this.status = 'not-started';
    } else {
      this.snackService.errorSnack();
      this.router.navigateByUrl('/');
    }
  }

  get schedules(): string[] {
    return this.scheduleService.schedules;
  }

  getScheduleDate(scheduleTitle: string): Date {
    const s = scheduleTitle.split('-').map(val => Number(val));
    return new Date(s[1], s[0] - 1, 1);
  }

  async removeSchedule(scheduleTitle: string): Promise<void> {
    this.status = 'in-progress';
    try {
      await this.scheduleService.removeSchedule(scheduleTitle);
      this.snackService.successSnack('Usunięto grafik');
    } catch (e) {
      this.snackService.errorSnack();
    } finally {
      this.status = 'in-progress';
    }
  }

}
