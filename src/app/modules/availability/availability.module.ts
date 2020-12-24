import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvailabilityViewComponent } from './availability-view/availability-view.component';
import { AvailabilityEditComponent } from './availability-edit/availability-edit.component';
import {MaterialModule} from '../../material.module';
import {ReactiveFormsModule} from '@angular/forms';
import {AvailabilityRoutingModule} from './availability-routing.module';
import { AddCustomPeriodDialogComponent } from './add-custom-period-dialog/add-custom-period-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';



@NgModule({
  declarations: [AvailabilityViewComponent, AvailabilityEditComponent, AddCustomPeriodDialogComponent],
  imports: [
    CommonModule,
    AvailabilityRoutingModule,
    MaterialModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class AvailabilityModule { }
