import {Component, OnInit} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {SnackService} from '../../../core/services/snack.service';
import {FormControl, Validators} from '@angular/forms';


@Component({
  selector: 'app-organization-settings',
  templateUrl: './organization-settings.component.html',
  styleUrls: ['./organization-settings.component.scss']
})
export class OrganizationSettingsComponent implements OnInit {
  nameControl = new FormControl('', [Validators.required]);

  constructor(private dataService: DataService,
              private snackService: SnackService) {
  }

  ngOnInit(): void {
    this.nameControl.setValue(this.dataService.organizationData?.name);
  }

  async changeOrganizationName(): Promise<void> {
    if (this.nameControl.valid) {
      try {
        await this.dataService.changeOrganizationName(this.nameControl.value);
        this.snackService.successSnack('Zmieniono nazwę');
      } catch (e) {
        this.snackService.errorSnack();
      }
    }
  }

}
