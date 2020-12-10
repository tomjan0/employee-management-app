import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {JoinOrganizationComponent} from './join-organization/join-organization.component';
import {MaterialModule} from '../../material.module';
import {OrganizationRoutingModule} from './organization-routing.module';


@NgModule({
  declarations: [JoinOrganizationComponent],
  imports: [
    CommonModule,
    OrganizationRoutingModule,
    MaterialModule
  ]
})
export class OrganizationModule {
}
