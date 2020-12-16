import {Component, OnDestroy, OnInit} from '@angular/core';
import {map, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subject} from 'rxjs';
import {SnackService} from '../../../core/services/snack.service';
import {AngularFirestoreDocument} from '@angular/fire/firestore';
import {OrganizationDataModel} from '../../../models/organization-data.model';
import {DataService} from '../../../core/services/data.service';

@Component({
  selector: 'app-join-organization',
  templateUrl: './join-organization.component.html',
  styleUrls: ['./join-organization.component.scss']
})
export class JoinOrganizationComponent implements OnInit, OnDestroy {
  ngUnsubscribe = new Subject<boolean>();
  organizationId: string | undefined = undefined;
  organizationDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined = undefined;
  organizationNameObs: Observable<string | undefined> | undefined = undefined;
  status: 'not-started' | 'in-progress' = 'not-started';

  constructor(private route: ActivatedRoute,
              private snackService: SnackService,
              private router: Router,
              private dataService: DataService) {
  }

  ngOnInit(): void {
    this.status = 'in-progress';
    this.route.queryParams
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(async params => {
        this.organizationId = params.orgId;

        if (!this.organizationId) {
          this.wrongLink();
        } else {
          this.organizationDoc = this.dataService.getOrganizationDocById(this.organizationId);
          this.organizationNameObs = this.organizationDoc.valueChanges().pipe(map(orgData => orgData?.name));
          this.status = 'not-started';
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
  }

  wrongLink(reason?: any): void {
    this.snackService.errorSnack(reason ? reason : 'Niepoprawny link', 5000);
    this.router.navigate(['/']);
  }

  async confirmJoin(): Promise<void> {
    this.status = 'in-progress';
    try {
      // @ts-ignore
      await this.dataService.requestMembership(this.organizationId);
      this.snackService.successSnack('Pomyślnie poproszono o dołączenie do organizacji!');
      this.router.navigate(['/']);
    } catch (e) {
      this.snackService.errorSnack('Wystąpił błąd, spróbuj ponownie.');
      this.status = 'not-started';
    }
  }

}
