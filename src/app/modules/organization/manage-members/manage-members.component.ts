import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {Subject} from 'rxjs';
import {MemberDataModel} from '../../../models/organization-data.model';
import {MatDialog} from '@angular/material/dialog';
import {RoleChooseDialogComponent} from '../role-choose-dialog/role-choose-dialog.component';
import {SnackService} from '../../../core/services/snack.service';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.scss']
})
export class ManageMembersComponent implements OnInit, OnDestroy {

  ngUnsubscribe = new Subject<boolean>();
  copied = false;
  roleNames = new Map<string, string>([['owner', 'właściciel'], ['manager', 'menedżer'], ['member', 'członek']]);

  constructor(private dataService: DataService, private snackService: SnackService, private matDialog: MatDialog) {
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

  async changeRole(member: MemberDataModel): Promise<void> {
    let validRoles = [];

    if (this.isCurrentUserOwner) {
      if (this.isCurrentUser(member.userId)) {
        if (this.countOwners() > 1) {
          validRoles = ['owner', 'manager', 'member'];
        } else {
          this.snackService.errorSnack('Musisz najpierw wyznaczyć innego właściciela');
          return;
        }
      } else {
        validRoles = ['owner', 'manager', 'member'];
      }
    } else if (this.isCurrentUserManager) {
      validRoles = ['manager', 'member'];
    } else {
      return;
    }

    const options = validRoles.map(role => {
      return {value: role, name: this.roleNames.get(role)};
    });

    const dialogRef = this.matDialog.open(RoleChooseDialogComponent, {
      data: {
        options
      }
    });
    const res = await dialogRef.afterClosed().toPromise();
    if (res) {
      await this.dataService.updateRole(member, res);
      this.snackService.successSnack('Zmieniono rolę');
    }
  }

  countOwners(): number {
    const count = this.members?.filter(m => m.role === 'owner').length;
    return count ? count : 0;
  }


  canChangeRoleOf(member: MemberDataModel): boolean {
    return this.isCurrentUserOwner || (this.isCurrentUserManager && member.role !== 'owner');
  }

  canRemove(member: MemberDataModel): boolean {
    return this.isCurrentUserOwner || (this.isCurrentUserManager && member.role !== 'owner') || this.isCurrentUser(member.userId);
  }

  async removeMember(member: MemberDataModel) {
    if (this.isCurrentUserOwner && this.isCurrentUser(member.userId) && this.countOwners() < 2) {
      this.snackService.errorSnack('Musisz najpierw wyznaczyć innego właściciela');
    } else if ((this.isCurrentUserOwner || this.isCurrentUserManager) && member.role !== 'owner') {

    }
  }

  get isCurrentUserManager(): boolean {
    const role = this.currentUserRole;
    if (role) {
      return role === 'manager';
    }
    return false;
  }

  get isCurrentUserOwner(): boolean {
    const role = this.currentUserRole;
    if (role) {
      return role === 'owner';
    }
    return false;
  }

  get inviteLink(): string {
    return this.dataService.organizationInviteLink;
  }


}
