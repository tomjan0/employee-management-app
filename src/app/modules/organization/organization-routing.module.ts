import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {ManageRequestsComponent} from './manage-requests/manage-requests.component';
import {ManageMembersComponent} from './manage-members/manage-members.component';
import {NoOrganizationChosenGuard} from '../../guards/no-organization-chosen.guard';
import {CreateOrganizationComponent} from './create-organization/create-organization.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'manage-requests', canActivate: [NoOrganizationChosenGuard]},
  {path: 'join', component: JoinOrganizationComponent},
  {path: 'create', component: CreateOrganizationComponent},
  {path: 'manage-requests', component: ManageRequestsComponent, canActivate: [NoOrganizationChosenGuard]},
  {path: 'manage-members', component: ManageMembersComponent, canActivate: [NoOrganizationChosenGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {
}
