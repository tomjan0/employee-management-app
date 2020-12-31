import {Component, OnInit} from '@angular/core';
import {ScheduleService} from '../services/schedule.service';
import {SnackService} from '../../../core/services/snack.service';
import {SimpleStatus} from '../../../core/types/custom.types';

@Component({
  selector: 'app-schedule-choose',
  templateUrl: './schedule-choose.component.html',
  styleUrls: ['./schedule-choose.component.scss']
})
export class ScheduleChooseComponent implements OnInit {
  status: SimpleStatus = 'not-started';

  constructor(private scheduleService: ScheduleService,
              private snackService: SnackService) {
  }


  ngOnInit(): void {
  }

  get schedules(): string[] {
    return this.scheduleService.schedules;
  }

  async removeSchedule(scheduleTitle: string): Promise<void> {
    this.status = 'in-progress';
    try {
      await this.scheduleService.removeSchedule(scheduleTitle);
      this.snackService.successSnack('Usunięto grafik');
    } catch (e) {
      console.log(e);
      this.snackService.errorSnack();
    } finally {
       this.status = 'in-progress';
    }
  }

}
