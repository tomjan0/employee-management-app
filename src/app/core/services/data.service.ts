import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import UserDataModel from '../../models/user-data.model';
import {MemberDataModel, OrganizationDataModel} from '../../models/organization-data.model';
import {Observable, Subject} from 'rxjs';
import {AvailabilitiesDataModel} from '../../models/availabilities-data.model';
import {takeUntil} from 'rxjs/operators';
import firebase from 'firebase/app';
import {OrganizationMembershipRequestModel} from '../../models/organization-membership-request.model';
import AdditionalOrganizationDataModel from '../../models/additional-organization-data.model';
import PublicUserDataModel from '../../models/public-user-data.model';
import firestoreUtils = firebase.firestore;
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDataObs: Observable<UserDataModel | undefined> | undefined;
  userData: UserDataModel | undefined;
  userOrganizationsObs: Observable<OrganizationDataModel | undefined>[] | undefined;
  organizationData: OrganizationDataModel | undefined;
  additionalOrganizationData: AdditionalOrganizationDataModel | undefined;
  organizationDataDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined;
  uid: string | undefined;
  organizationDataReady = new Subject<boolean>();
  organizationUnsubscribe = new Subject<boolean>();
  userUnsubscribe = new Subject<boolean>();

  constructor(private firestore: AngularFirestore, private router: Router) {
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
      .pipe(takeUntil(this.userUnsubscribe));
    // subscribe to data changes
    this.userDataObs.subscribe(userData => {
      const newData = userData as UserDataModel;
      this.userOrganizationsObs = newData?.organizations?.map(orgId => {
        return this.getOrganizationDocById(orgId).valueChanges().pipe(takeUntil(this.userUnsubscribe));
      });
      // assign user data data
      const oldData = this.userData;
      this.userData = newData;
      console.log(oldData, newData);
      if (newData.organizations.length !== oldData?.organizations.length) {
        if (this.organizationData?.id && !newData.organizations.includes(this.organizationData.id)) {
          this.resetOrganizationData();
        }
        this.loadOrganizationData(0);
      }
    });
  }

  loadOrganizationData(organizationIndex: number): void {
    if (this.userData && this.userData.organizations[organizationIndex]) {
      // subscribe to given organization data
      this.organizationDataDoc = this.firestore.collection('organizations').doc(this.userData.organizations[organizationIndex]);
      this.organizationDataDoc.valueChanges({idField: 'id'}).pipe(takeUntil(this.organizationUnsubscribe)).subscribe(orgData => {
        orgData?.members.sort((a) => a.userId === this.userData?.id ? -1 : 0);
        this.loadAdditionalOrganizationData(this.organizationData, orgData);
        this.organizationData = orgData as OrganizationDataModel;
        this.organizationDataReady.next(true);
        this.organizationDataReady.complete();
      });
    } else {
      this.organizationDataReady.next(true);
      this.organizationDataReady.complete();
    }
  }

  async loadAdditionalOrganizationData(oldData: OrganizationDataModel | undefined, newData: OrganizationDataModel | undefined): Promise<void> {
    if (newData) {
      if (!this.additionalOrganizationData) {
        this.additionalOrganizationData = {membersUsernames: Array(newData.members.length)};
      }
      for (let i = 0; i < newData.members.length; i++) {
        const member = newData.members[i];
        if (!oldData || !oldData.members[i] || member.userId !== oldData.members[i].userId) {
          const memberPublicData = await this.getPublicUserDataOnce(member.userId);
          this.additionalOrganizationData.membersUsernames[i] = (memberPublicData ? memberPublicData.username : 'Użytkownik');
        }
      }
    } else {
      this.additionalOrganizationData = undefined;
    }
  }

  get currentUserMemberInfo(): MemberDataModel | undefined {
    return this.organizationData?.members.find(member => member.userId === this.userData?.id);
  }

  getOrganizationDocById(organizationId: string): AngularFirestoreDocument<OrganizationDataModel> {
    return this.firestore.collection('organizations').doc(organizationId);
  }

  getUserDocById(userId: string): AngularFirestoreDocument<UserDataModel> {
    return this.firestore.collection('users').doc(userId);
  }

  async getPublicUserDataOnce(uid: string): Promise<PublicUserDataModel | undefined> {
    const doc = await this.firestore.collection('public-user-data').doc<PublicUserDataModel>(uid).get().toPromise();
    return doc.data();
  }

  async getCurrentPendingOrganizationMembershipRequestsCollection(): Promise<AngularFirestoreCollection<OrganizationMembershipRequestModel>> {
    await this.organizationDataReady.toPromise();
    return this.firestore.collection<OrganizationMembershipRequestModel>
    ('membership-requests',
      ref => ref
        .where('organizationId', '==', this.organizationData?.id)
        .where('status', '==', 'pending'));
  }

  signOut(): void {
    this.userUnsubscribe.next(true);
    this.userDataObs = undefined;
    this.userData = undefined;
    this.userOrganizationsObs = undefined;
    this.uid = undefined;
    this.resetOrganizationData();
  }

  resetOrganizationData(): void {
    this.organizationUnsubscribe.next(true);
    this.organizationData = undefined;
    this.organizationDataDoc = undefined;
    this.organizationDataReady = new Subject<boolean>();
    this.router.navigateByUrl('/');
  }

  changeOrganization(organizationIndex: number): void {
    this.resetOrganizationData();
    this.loadOrganizationData(organizationIndex);
  }

  get organizationName(): string | undefined {
    return this.organizationData?.name;
  }

  get username(): string | undefined {
    return this.userData?.username;
  }

  get organizationInviteLink(): string {
    return `http://localhost:4200/organization/join?orgId=${this.organizationData?.id}`;
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

  async updateRole(member: MemberDataModel, role: string): Promise<void> {
    try {
      if (member.role !== role) {
        // @ts-ignore
        await this.organizationDataDoc?.update({members: firestoreUtils.FieldValue.arrayUnion({userId: member.userId, role})});
        // @ts-ignore
        await this.organizationDataDoc?.update({members: firestoreUtils.FieldValue.arrayRemove(member)});
      }
    } catch (e) {
      throw e;
    }
  }

  async removeMember(member: MemberDataModel): Promise<void> {
    try {
      // @ts-ignore
      await this.organizationDataDoc?.update({members: firestoreUtils.FieldValue.arrayRemove(member)});
      // @ts-ignore
      await this.getUserDocById(member.userId).update({organizations: firestoreUtils.FieldValue.arrayRemove(this.organizationData?.id)});
      if (member.userId === this.uid) {
        this.resetOrganizationData();
      }
    } catch (e) {
      throw e;
    }
  }


}
