import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NavigationComponent} from './navigation/navigation.component';
import {MaterialModule} from '../material.module';
import {RouterModule} from '@angular/router';
import {MatRippleModule} from '@angular/material/core';
import { CustomSnackComponent } from './snacks/custom-snack/custom-snack.component';
import { NoOrganizationChosenComponent } from './views/no-organization-chosen/no-organization-chosen.component';


@NgModule({
  declarations: [NavigationComponent, CustomSnackComponent, NoOrganizationChosenComponent],
  exports: [
    NavigationComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    MatRippleModule
  ]
})
export class CoreModule {
}
