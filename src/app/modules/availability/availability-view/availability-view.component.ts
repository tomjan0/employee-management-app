import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {AvailabilityViewData, LocalAvailabilitiesPositionDataModel} from '../../../models/availabilities-data.model';
import {MatTable} from '@angular/material/table';
import {getInitials} from '../../../core/utils/utils';


@Component({
  selector: 'app-availability-view',
  templateUrl: './availability-view.component.html',
  styleUrls: ['./availability-view.component.scss']
})
export class AvailabilityViewComponent implements OnInit, OnDestroy {
  public date: Date = new Date();

  data: AvailabilityViewData[] = [];
  displayedColumns: string[] = [];
  hideNames = false;

  @ViewChild(MatTable) matTable?: MatTable<any>;

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
  }

  changeMonth(diff: 1 | -1): void {
    const date = new Date(this.date);
    date.setMonth(date.getMonth() + diff);
    this.date = date;
    this.data = [];
    this.refreshData();
  }

  nextMonth(): void {
    this.changeMonth(1);
  }

  prevMonth(): void {
    this.changeMonth(-1);
  }

  getDaysCount(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  async loadData(): Promise<void> {
    await this.dataService.waitForOrganizationData();

    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);

    await this.refreshData();
  }

  async refreshData(): Promise<void> {
    const month = this.date.getMonth();
    const year = this.date.getFullYear();
    const dayCount = this.getDaysCount(year, month);

    const data = await this.loadAvailabilities(month, year, dayCount);
    this.data = [data];
    this.displayedColumns = ['name', ...Array.from(Array(dayCount).keys()).map(i => `day${i}`)];


    const role = this.dataService.currentUserMemberInfo?.role;
    if ((role === 'owner' || role === 'manager') && this.dataService.organizationData) {
      for (const member of this.dataService.organizationData.members) {
        if (member.userId !== this.dataService.uid) {
          this.data.push(await this.loadAvailabilities(month, year, dayCount, member.userId));
        }
      }
      this.matTable?.renderRows();
    }
  }

  async loadAvailabilities(month: number, year: number, dayCount: number, uid?: string): Promise<AvailabilityViewData> {
    const positions: LocalAvailabilitiesPositionDataModel[] = (Array.from(Array(dayCount).keys()).map(day => {
      const tmp = new Date(this.date);
      tmp.setDate(day + 1);
      return {date: tmp, periods: [], preferredPeriods: []};
    }));

    const availabilities = await this.dataService.getAvailabilitiesDataOnce(month, year, uid);
    for (const pos of availabilities.positions) {
      const day = pos.timestamp.toDate().getDate();
      positions[day - 1].periods = pos.periods;
    }
    for (const pos of availabilities.preferredPositions) {
      const day = pos.timestamp.toDate().getDate();
      positions[day - 1].preferredPeriods = pos.periods;
    }

    const info = this.dataService.getMemberInfo(uid);
    return {username: this.dataService.getMemberName(uid), role: info?.role || '', positions};
  }

  getInitials(username: string): string {
    return getInitials(username);
  }
}
