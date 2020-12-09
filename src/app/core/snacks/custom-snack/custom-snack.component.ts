import {Component, Inject, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import SnackTypes from '../../enums/snack-types.enum';

@Component({
  selector: 'app-custom-snack',
  templateUrl: './custom-snack.component.html',
  styleUrls: ['./custom-snack.component.scss']
})
export class CustomSnackComponent implements OnInit {
  private data;
  public type;

  constructor(@Inject(MAT_SNACK_BAR_DATA) data: string) {
    this.data = JSON.parse(data);
    this.type = this.data.type;
  }

  ngOnInit(): void {
  }

  get message(): string {
    return this.data.message;
  }

  get icon(): string {
    switch (this.type) {
      case SnackTypes.Success:
        return 'check_circle';
      case SnackTypes.Error:
        return 'error';
      case SnackTypes.Warning:
        return 'warning';
      case SnackTypes.Info:
        return 'info';
    }
    return '';
  }

  get class(): string {
    switch (this.type) {
      case SnackTypes.Success:
        return 'success';
      case SnackTypes.Error:
        return 'error';
      case SnackTypes.Warning:
        return 'warning';
      case SnackTypes.Info:
        return 'info';
    }
    return '';
  }

}
