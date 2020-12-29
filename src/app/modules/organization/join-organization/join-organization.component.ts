import {Component, OnDestroy, OnInit} from '@angular/core';
import {map, take, takeUntil} from 'rxjs/operators';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject} from 'rxjs';
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
  organizationId = '';
  organizationDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined = undefined;
  organizationName = '';
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
          this.prepareData();
        }
      });
  }

  async prepareData(): Promise<void> {
    await this.dataService.organizationDataReady.toPromise();
    if (this.dataService.userData?.organizations.includes(this.organizationId)) {
      this.wrongLink('Należysz już do tej organizacji');
    } else {
      this.organizationDoc = this.dataService.getOrganizationDocById(this.organizationId);
      const organizationData = await this.organizationDoc.snapshotChanges()
        .pipe(take(1),
          map(orgData => orgData.payload.exists ? orgData.payload.data() : undefined)).toPromise();
      if (!organizationData) {
        this.wrongLink();
      } else {
        this.organizationName = organizationData.name;
        this.status = 'not-started';
      }
    }
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
