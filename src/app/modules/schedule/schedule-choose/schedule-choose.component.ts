import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScheduleService} from '../services/schedule.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-schedule-choose',
  templateUrl: './schedule-choose.component.html',
  styleUrls: ['./schedule-choose.component.scss']
})
export class ScheduleChooseComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<boolean>();
  month?: number;
  year?: number;

  constructor(private scheduleService: ScheduleService, private route: ActivatedRoute) {
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(params => {
        this.month = params.month;
        this.year = params.year;
      });
  }


  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  get schedules(): string[] {
    return this.scheduleService.schedules;
  }

  click(): void {
    console.log('click');
  }
}
