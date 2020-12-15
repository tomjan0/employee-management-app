import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {MaterialModule} from '../../material.module';
import {OrganizationRoutingModule} from './organization-routing.module';
import { ManageRequestsComponent } from './manage-requests/manage-requests.component';
import { ManageMembersComponent } from './manage-members/manage-members.component';


@NgModule({
  declarations: [JoinOrganizationComponent, ManageRequestsComponent, ManageMembersComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    MaterialModule
  ]
})
export class OrganizationModule {
}
