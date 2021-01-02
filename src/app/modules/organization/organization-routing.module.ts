import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {ManageRequestsComponent} from './manage-requests/manage-requests.component';
import {ManageMembersComponent} from './manage-members/manage-members.component';
import {NoOrganizationChosenGuard} from '../../guards/no-organization-chosen.guard';
import {CreateOrganizationComponent} from './create-organization/create-organization.component';
import {OrganizationSettingsComponent} from './organization-settings/organization-settings.component';
import {OwnerOrManagerGuard} from '../../guards/owner-or-manager.guard';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'manage-members', canActivate: [NoOrganizationChosenGuard]},
  {path: 'join', component: JoinOrganizationComponent},
  {path: 'create', component: CreateOrganizationComponent},
  {path: 'manage-requests', component: ManageRequestsComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]},
  {path: 'manage-members', component: ManageMembersComponent, canActivate: [NoOrganizationChosenGuard]},
  {path: 'settings', component: OrganizationSettingsComponent, canActivate: [NoOrganizationChosenGuard, OwnerOrManagerGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {
}
