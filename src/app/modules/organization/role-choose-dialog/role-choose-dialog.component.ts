import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-role-choose-dialog',
  templateUrl: './role-choose-dialog.component.html',
  styleUrls: ['./role-choose-dialog.component.scss']
})
export class RoleChooseDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { options: { name: string, value: string }[] }) {
  }

  value = '';

  ngOnInit(): void {
  }

  get options(): { name: string; value: string }[] {
    return this.data.options;
  }

}
