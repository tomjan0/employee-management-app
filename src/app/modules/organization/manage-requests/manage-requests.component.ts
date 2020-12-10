import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {Subject} from 'rxjs';
import UserDataModel from '../../../models/user-data.model';

@Component({
  selector: 'app-manage-requests',
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject<boolean>();

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  get pendingUsers(): string[] | undefined {
    const pm = this.dataService.organizationData?.pendingMembers;
    return pm ? pm : [];
  }

  getPendingMemberData(uid: string): UserDataModel | undefined {
    return this.dataService.pendingUsersData.get(uid);
  }

}
