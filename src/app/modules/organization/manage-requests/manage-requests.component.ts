import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {Subject} from 'rxjs';
import UserDataModel from '../../../models/user-data.model';
import {SnackService} from '../../../core/services/snack.service';

@Component({
  selector: 'app-manage-requests',
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject<boolean>();

  constructor(private dataService: DataService, private snackService: SnackService) {
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

  getPendingUsername(uid: string): string {
    const username = this.getPendingMemberData(uid)?.username;
    return username ? username : 'Brak nazwy użytkownika';
  }

  get organizationName(): string | undefined {
    return this.dataService.organizationName;
  }

  async accept(uid: string): Promise<void> {
    try {
      await this.dataService.acceptUser(uid);
      this.snackService.successSnack('Prośba zaakcetowana pomyślnie!');
    } catch (e) {
      console.log(e);
      this.snackService.errorSnack('Wystąpił błąd');
    }
  }

  decline(uid: string): void {

  }

}
