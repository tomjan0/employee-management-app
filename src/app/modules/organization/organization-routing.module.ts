import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {JoinOrganizationComponent} from './join-organization/join-organization.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: 'join'},
  {path: 'join', component: JoinOrganizationComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {
}
