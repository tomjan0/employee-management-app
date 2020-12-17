import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {Subject} from 'rxjs';
import {MemberDataModel} from '../../../models/organization-data.model';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject<boolean>();
  copied = false;
  roleNames = new Map<string, string>([['owner', 'właściciel'], ['manager', 'Menedżer'], ['member', 'członek']]);

  constructor(private dataService: DataService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  get members(): MemberDataModel[] | undefined {
    return this.dataService.organizationData?.members;
  }

  getMemberName(index: number): string | undefined {
    return this.dataService.additionalOrganizationData?.membersUsernames[index];
  }

  isCurrentUser(memberId: string): boolean {
    return this.dataService.userData?.id === memberId;
  }

  get currentUserRole(): 'owner' | 'manager' | 'member' | undefined {
    return this.dataService.currentUserMemberInfo?.role;
  }

  getRoleName(role: string): string | undefined {
    if (role) {
      return this.roleNames.get(role);
    }
    return this.roleNames.get('member');
  }

  get canChangeRoles(): boolean {
    const role = this.currentUserRole;
    if (role) {
      return role === 'owner' || role === 'manager';
    }
    return false;
  }

  get inviteLink(): string {
    return this.dataService.organizationInviteLink;
  }


}
