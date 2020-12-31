import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import {MaterialModule} from '../material.module';
import {MatDialogModule} from '@angular/material/dialog';
import {AddConfigShiftDialogComponent} from './dialogs/add-config-shift-dialog/add-config-shift-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';
import { ConfigEditComponent } from './config-edit/config-edit.component';



@NgModule({
  declarations: [ConfirmDialogComponent, AddConfigShiftDialogComponent, ConfigEditComponent],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
