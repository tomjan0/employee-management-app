import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import UserDataModel from '../../models/user-data.model';
import {OrganizationDataModel} from '../../models/organization-data.model';
import {Observable, Subject} from 'rxjs';
import {AvailabilitiesDataModel} from '../../models/availabilities-data.model';
import {takeUntil} from 'rxjs/operators';
import firebase from 'firebase/app';
import {OrganizationMembershipRequestModel} from '../../models/organization-membership-request.model';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDataObs: Observable<UserDataModel | undefined> | undefined = undefined;
  userData: UserDataModel | undefined = undefined;
  userOrganizationsObs: Observable<OrganizationDataModel | undefined>[] | undefined = undefined;
  organizationData: OrganizationDataModel | undefined = undefined;
  organizationDataDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined = undefined;
  uid: string | undefined = undefined;
  dataReady = new Subject<boolean>();
  ngUnsubscribe = new Subject<boolean>();

  constructor(private firestore: AngularFirestore) {
  }

  getFirestore(): AngularFirestore {
    return this.firestore;
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
    // get user document observer
    this.userDataObs = this.firestore.collection('users').doc<UserDataModel>(uid)
      .valueChanges({idField: 'id'})
      .pipe(takeUntil(this.ngUnsubscribe));
    // subscribe to data changes
    this.userDataObs.subscribe(userData => {
      const data = userData as UserDataModel;
      this.userOrganizationsObs = data.organizations.map(orgId => {
        return this.getOrganizationDocById(orgId).valueChanges().pipe(takeUntil(this.ngUnsubscribe));
      });
      // assign user data data
      this.userData = data;
      if (data.organizations.length > 0) {
        // subscribe to first organization data
        this.organizationDataDoc = this.firestore.collection('organizations').doc(data.organizations[0]);
        this.organizationDataDoc.valueChanges({idField: 'id'}).pipe(takeUntil(this.ngUnsubscribe)).subscribe(orgData => {
          this.organizationData = orgData as OrganizationDataModel;
          this.dataReady.next(true);
          this.dataReady.complete();
        });
      }
    });
  }

  getOrganizationDocById(organizationId: string): AngularFirestoreDocument<OrganizationDataModel> {
    return this.firestore.collection('organizations').doc(organizationId);
  }

  getUserDocById(userId: string): AngularFirestoreDocument<UserDataModel> {
    return this.firestore.collection('users').doc(userId);
  }

  // tslint:disable-next-line:max-line-length
  async getCurrentPendingOrganizationMembershipRequestsCollection(): Promise<AngularFirestoreCollection<OrganizationMembershipRequestModel>> {
    await this.dataReady.toPromise();
    return this.firestore.collection<OrganizationMembershipRequestModel>
    ('membership-requests',
      ref => ref
        .where('organizationId', '==', this.organizationData?.id)
        .where('status', '==', 'pending'));
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

  async acceptMembershipRequest(request: OrganizationMembershipRequestModel): Promise<void> {
    try {
      await this.firestore
        .collection('membership-requests')
        .doc<OrganizationMembershipRequestModel>(request.id)
        .update({status: 'accepted'});
    } catch (e) {
      throw e;
    }
  }

  async declineMembershipRequest(request: OrganizationMembershipRequestModel): Promise<void> {
    try {
      await this.firestore
        .collection('membership-requests')
        .doc<OrganizationMembershipRequestModel>(request.id)
        .update({status: 'declined'});
    } catch (e) {
      throw e;
    }
  }

  async requestMembership(organizationId: string): Promise<void> {
    if (this.userData?.id) {
      try {
        const requestData: OrganizationMembershipRequestModel = {
          organizationId,
          // @ts-ignore
          requestTime: firebase.firestore.FieldValue.serverTimestamp(),
          status: 'pending',
          userId: this.userData?.id
        };
        await this.firestore.collection('membership-requests').add(requestData);
      } catch (e) {
        throw e;
      }
    } else {
      throw new Error('userdata-not-fetched-yet');
    }
  }


}
