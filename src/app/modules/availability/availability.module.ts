import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityViewComponent } from './availability-view/availability-view.component';
import { AvailabilityEditComponent } from './availability-edit/availability-edit.component';
import {MaterialModule} from '../../material.module';
import {ReactiveFormsModule} from '@angular/forms';
import {AvailabilityRoutingModule} from './availability-routing.module';



@NgModule({
  declarations: [AvailabilityViewComponent, AvailabilityEditComponent],
  imports: [
    CommonModule,
    AvailabilityRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class AvailabilityModule { }
