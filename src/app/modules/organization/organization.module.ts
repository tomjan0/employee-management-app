import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {MaterialModule} from '../../material.module';
import {OrganizationRoutingModule} from './organization-routing.module';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';
import {ClipboardModule} from '@angular/cdk/clipboard';


@NgModule({
  declarations: [JoinOrganizationComponent, ManageRequestsComponent, ManageMembersComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    MaterialModule,
    ClipboardModule
  ]
})
export class OrganizationModule {
}
