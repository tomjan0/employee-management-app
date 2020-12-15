import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {ManageRequestsComponent} from './manage-requests/manage-requests.component';
import {ManageMembersComponent} from './manage-members/manage-members.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'manage-requests'},
  {path: 'join', component: JoinOrganizationComponent},
  {path: 'manage-requests', component: ManageRequestsComponent},
  {path: 'manage-members', component: ManageMembersComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {
}
