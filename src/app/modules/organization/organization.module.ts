import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {MaterialModule} from '../../material.module';
import {OrganizationRoutingModule} from './organization-routing.module';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import { RoleChooseDialogComponent } from './role-choose-dialog/role-choose-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';


@NgModule({
  declarations: [JoinOrganizationComponent, ManageRequestsComponent, ManageMembersComponent, RoleChooseDialogComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    MaterialModule,
    ClipboardModule,
    MatDialogModule
  ]
})
export class OrganizationModule {
}
