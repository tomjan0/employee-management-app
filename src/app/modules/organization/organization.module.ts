import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {MaterialModule} from '../../material.module';
import {OrganizationRoutingModule} from './organization-routing.module';
import {ManageRequestsComponent} from './manage-requests/manage-requests.component';
import {ManageMembersComponent} from './manage-members/manage-members.component';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {RoleChooseDialogComponent} from './role-choose-dialog/role-choose-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {CreateOrganizationComponent} from './create-organization/create-organization.component';
import {ReactiveFormsModule} from '@angular/forms';
import {OrganizationSettingsComponent} from './organization-settings/organization-settings.component';
import {AddConfigShiftDialogComponent} from './add-config-shift-dialog/add-config-shift-dialog.component';


@NgModule({
  declarations: [
    JoinOrganizationComponent,
    ManageRequestsComponent,
    ManageMembersComponent,
    RoleChooseDialogComponent,
    CreateOrganizationComponent,
    OrganizationSettingsComponent,
    AddConfigShiftDialogComponent
  ],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    MaterialModule,
    ClipboardModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class OrganizationModule {
}
