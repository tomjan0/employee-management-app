import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ScheduleEditComponent} from './schedule-edit/schedule-edit.component';
import {ScheduleChooseComponent} from './schedule-choose/schedule-choose.component';
import {ScheduleRoutingModule} from './schedule-routing.module';
import {MaterialModule} from '../../material.module';
import {ScheduleNewComponent} from './schedule-new/schedule-new.component';
import {MatStepperModule} from '@angular/material/stepper';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {SharedModule} from '../../shared/shared.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatTabsModule} from '@angular/material/tabs';
import { ScheduleViewComponent } from './schedule-view/schedule-view.component';


@NgModule({
  declarations: [ScheduleEditComponent, ScheduleChooseComponent, ScheduleNewComponent, ScheduleViewComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    MaterialModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatDialogModule,
    SharedModule,
    DragDropModule,
    MatTabsModule
  ]
})
export class ScheduleModule {
}
