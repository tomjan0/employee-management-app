import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityViewComponent } from './availability-view/availability-view.component';
import { AvailabilityEditComponent } from './availability-edit/availability-edit.component';



@NgModule({
  declarations: [AvailabilityViewComponent, AvailabilityEditComponent],
  imports: [
    CommonModule
  ]
})
export class AvailabilityModule { }
