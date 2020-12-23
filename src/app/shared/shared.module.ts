import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import {MaterialModule} from '../material.module';
import {MatDialogModule} from '@angular/material/dialog';



@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule
  ]
})
export class SharedModule { }
