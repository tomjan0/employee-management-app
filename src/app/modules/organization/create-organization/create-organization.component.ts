import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {DataService} from '../../../core/services/data.service';
import {SimpleStatus} from '../../../core/types/custom.types.';
import {SnackService} from '../../../core/services/snack.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss']
})
export class CreateOrganizationComponent implements OnInit {
  organizationName = new FormControl('', [Validators.required]);
  createOrganizationForm = new FormGroup({organizationName: this.organizationName});
  status: SimpleStatus = 'not-started';

  constructor(private dataService: DataService,
              private snackService: SnackService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  getErrorMessage(field: FormControl): string {
    if (field.hasError('required')) {
      return 'Pole nie może być puste';
    }
    return '';
  }

  async createOrganization(): Promise<void> {
    if (this.createOrganizationForm.valid) {
      this.status = 'in-progress';
      try {
        await this.dataService.createOrganization(this.organizationName.value);
        this.snackService.successSnack(`Utworzono organizację ${this.organizationName.value}`);
        this.status = 'completed';
        this.router.navigateByUrl('/');
      } catch (e) {
        this.snackService.errorSnack();
        this.status = 'not-started';
      }
    }
  }

  get isInProgress(): boolean {
    return this.status === 'in-progress';
  }

}
