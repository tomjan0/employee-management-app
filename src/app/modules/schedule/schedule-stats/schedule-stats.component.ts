import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {DataService} from '../../../core/services/data.service';
import {getInitials} from '../../../core/utils/utils';
import {ScheduleService} from '../services/schedule.service';
import {AvailabilityPeriod} from '../../../models/availabilities-data.model';

@Component({
  selector: 'app-schedule-stats',
  templateUrl: './schedule-stats.component.html',
  styleUrls: ['./schedule-stats.component.scss']
})
export class ScheduleStatsComponent implements OnInit {

  public date: Date = new Date();

  data: { role: string, username: string, uid: string, stats: number[] }[] = [];
  displayedColumns: string[] = [];
  hideNames = false;

  monthDates = Array.from(Array(12).keys()).map(i => new Date(this.date.getFullYear(), i));

  @ViewChild(MatTable) matTable?: MatTable<any>;

  constructor(private dataService: DataService,
              private scheduleService: ScheduleService) {
    this.displayedColumns = ['name', ...Array.from(Array(12).keys()).map(i => `month-${i}`)];
  }

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await this.dataService.waitForOrganizationData();
    await this.scheduleService.waitForSchedules();

    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);

    await this.refreshData();
  }

  async refreshData(): Promise<void> {
    const baseArray = Array.from(Array(12).keys());

    const role = this.dataService.currentUserMemberInfo?.role;
    const data = [{
      role: this.dataService.currentUserMemberInfo?.role || '',
      username: this.dataService.getMemberName(),
      uid: this.dataService.uid || '',
      stats: baseArray.map(() => 0)
    }];

    if ((role === 'owner' || role === 'manager') && this.dataService.organizationData) {
      for (const member of this.dataService.organizationData.members) {
        if (member.userId !== this.dataService.uid) {
          const username = this.dataService.getMemberName(member.userId);
          data.push({role: member.role, username, uid: member.userId, stats: baseArray.map(() => 0)});
        }
      }
    }

    const schedules = await this.scheduleService.getAllSchedulesDataByYear(this.date.getFullYear());
    console.log(schedules);

    for (const user of data) {
      for (const [s, schedule] of schedules.entries()) {
        const userEntry = schedule?.entries.find(e => e.assignee === user.uid);
        if (userEntry) {
          user.stats[s] += this.countPeriods(userEntry.shifts.map(shift => shift.periods));
        }
      }
    }

    this.data = data;

  }

  countPeriods(periods: AvailabilityPeriod[][]): number {
    let sum = 0;
    for (const p of periods) {
      for (const period of p) {
        const s = period.start.split(':');
        const e = period.end.split(':');
        sum += Number(e[0]) + Number(e[1]) / 60 - ((Number(s[0]) + Number(s[1]) / 60));
      }
    }
    return sum;
  }

  changeYear(diff: 1 | -1): void {
    const date = new Date(this.date);
    date.setFullYear(date.getFullYear() + diff);
    this.date = date;
    this.data = [];
    this.refreshData();
  }

  nextYear(): void {
    this.changeYear(1);
  }

  prevYear(): void {
    this.changeYear(-1);
  }


  getInitials(username: string): string {
    return getInitials(username);
  }
}
