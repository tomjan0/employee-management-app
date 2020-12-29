import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {Observable, Subject} from 'rxjs';
import {SnackService} from '../../../core/services/snack.service';
import {OrganizationMembershipRequestModel} from '../../../models/organization-membership-request.model';
import {map, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-manage-requests',
  templateUrl: './manage-requests.component.html',
  styleUrls: ['./manage-requests.component.scss']
})
export class ManageRequestsComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject<boolean>();
  membershipRequests: Observable<OrganizationMembershipRequestModel[]> | undefined;
  usernames: Observable<string | undefined>[] | undefined;

  constructor(private dataService: DataService, private snackService: SnackService) {
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  async loadRequests(): Promise<void> {
    this.membershipRequests = (await this.dataService.getCurrentPendingOrganizationMembershipRequestsCollection())
      .valueChanges({idField: 'id'}).pipe(takeUntil(this.ngUnsubscribe));
    this.membershipRequests.subscribe(requests => {
      this.usernames = requests.map(request => {
        return this.dataService.getUserDocById(request.userId).valueChanges()
          .pipe(takeUntil(this.ngUnsubscribe), map(userData => userData?.username));
      });
    });
  }


  get organizationName(): string | undefined {
    return this.dataService.organizationName;
  }

  async accept(request: OrganizationMembershipRequestModel): Promise<void> {
    try {
      await this.dataService.acceptMembershipRequest(request);
      this.snackService.successSnack('Prośba zaakcetowana pomyślnie!');
    } catch (e) {
      this.snackService.errorSnack('Wystąpił błąd');
    }
  }

  async decline(request: OrganizationMembershipRequestModel): Promise<void> {
    try {
      await this.dataService.declineMembershipRequest(request);
      this.snackService.successSnack('Prośba odrzucona pomyślnie!');
    } catch (e) {
      this.snackService.errorSnack('Wystąpił błąd');
    }
  }

  getUsernameObs(i: number): Observable<string | undefined> | undefined {
    return this.usernames?.[i];
  }
}
