import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import UserDataModel from '../../models/user-data.model';
import {OrganizationDataModel} from '../../models/organization-data.model';
import {Observable, Subject} from 'rxjs';
import {AvailabilitiesDataModel} from '../../models/availabilities-data.model';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDataObs: Observable<UserDataModel | undefined> | undefined = undefined;
  userData: UserDataModel | undefined = undefined;
  userOrganizationsObs: Observable<OrganizationDataModel | undefined>[] | undefined = undefined;
  organizationData: OrganizationDataModel | undefined = undefined;
  organizationDataDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined = undefined;
  pendingUsersData = new Map<string, UserDataModel>();
  uid: string | undefined = undefined;
  dataReady = new Subject<boolean>();
  ngUnsubscribe = new Subject<boolean>();

  constructor(private firestore: AngularFirestore) {
  }

  getLocal(key: string): string | null {
    return localStorage.getItem(key);
  }

  setLocal(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getAvailabilitiesDoc(month: number, year: number): AngularFirestoreDocument<AvailabilitiesDataModel> | undefined {
    if (this.organizationData) {
      console.log(this.organizationData);
      return this.firestore
        .collection('availabilities')
        .doc(undefined)
        .collection(`${month}-${year}`)
        .doc<AvailabilitiesDataModel>(this.uid);
    } else {
      return undefined;
    }
  }


  loadUserData(uid: string): void {
    this.uid = uid;
    this.userDataObs = this.firestore.collection('users').doc<UserDataModel>(uid).valueChanges().pipe(takeUntil(this.ngUnsubscribe));
    this.userDataObs.subscribe(userData => {
      const data = userData as UserDataModel;
      this.userOrganizationsObs = data.organizations.map(orgId => this.getOrganizationDocById(orgId).valueChanges());
      this.userData = data;
      if (data.organizations.length > 0) {
        this.organizationDataDoc = this.firestore.collection('organizations').doc(data.organizations[0]);
        this.organizationDataDoc.valueChanges({idField: 'id'}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgData => {
          this.organizationData = orgData as OrganizationDataModel;
          this.dataReady.next(true);
          this.dataReady.complete();

          for (const pendingMemberId of this.organizationData.pendingMembers) {
            this.firestore.collection('users').doc<UserDataModel>(pendingMemberId).valueChanges().subscribe(pendingMemberData => {
              if (pendingMemberData) {
                this.pendingUsersData.set(pendingMemberId, pendingMemberData);
              }
            });
          }
        });
      }
    });
  }

  getOrganizationDocById(organizationId: string): AngularFirestoreDocument<OrganizationDataModel> {
    return this.firestore.collection('organizations').doc(organizationId);
  }

  signOut(): void {
    this.ngUnsubscribe.next(true);
    this.userDataObs = undefined;
    this.userData = undefined;
    this.userOrganizationsObs = undefined;
    this.organizationData = undefined;
    this.organizationDataDoc = undefined;
    this.uid = undefined;
    this.dataReady = new Subject<boolean>();
  }

  get organizationName(): string | undefined {
    return this.organizationData?.name;
  }

  get username(): string | undefined {
    return this.userData?.username;
  }

}
