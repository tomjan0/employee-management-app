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
import {ScheduleViewComponent} from './schedule-view/schedule-view.component';
import {GenerateScheduleDialogComponent} from './generate-schedule-dialog/generate-schedule-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {ScheduleStatsComponent} from './schedule-stats/schedule-stats.component';
import {ScheduleSettingsComponent} from './schedule-settings/schedule-settings.component';
import { SetMinMaxHoursDialogComponent } from './set-min-max-hours-dialog/set-min-max-hours-dialog.component';


@NgModule({
  declarations: [
    ScheduleEditComponent,
    ScheduleChooseComponent,
    ScheduleNewComponent,
    ScheduleViewComponent,
    GenerateScheduleDialogComponent,
    ScheduleStatsComponent,
    ScheduleSettingsComponent,
    SetMinMaxHoursDialogComponent],
  imports: [
    CommonModule,
    ScheduleRoutingModule,
    MaterialModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatDialogModule,
    SharedModule,
    DragDropModule,
    MatTabsModule,
    MatCheckboxModule
  ]
})
export class ScheduleModule {
}
