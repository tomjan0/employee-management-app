import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';
import UserDataModel from '../../models/user-data.model';
import {MemberDataModel, MergedMemberDataModel, OrganizationDataModel} from '../../models/organization-data.model';
import {Observable, Subject} from 'rxjs';
import {AvailabilitiesDataModel, AvailabilityPeriod} from '../../models/availabilities-data.model';
import {takeUntil} from 'rxjs/operators';
import firebase from 'firebase/app';
import {OrganizationMembershipRequestModel} from '../../models/organization-membership-request.model';
import AdditionalOrganizationDataModel from '../../models/additional-organization-data.model';
import PublicUserDataModel from '../../models/public-user-data.model';
import {Router} from '@angular/router';
import ConfigModel, {ConfigShiftModel} from '../../models/config.model';
import {DayShort} from '../types/custom.types';
import firestoreUtils = firebase.firestore;
import Timestamp = firebase.firestore.Timestamp;


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

  // tslint:disable-next-line:typedef
  get utils() {
    return firestoreUtils;
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
      if (newData.organizations.length !== oldData?.organizations.length) {

        if (this.organizationData?.id && !newData.organizations.includes(this.organizationData.id)) {
          this.resetOrganizationData();
          // this.loadOrganizationData(0);
        }
        if (!this.organizationData) {
          this.loadOrganizationData(0);
        }
      }
    });
  }

  loadOrganizationData(organizationIndex: number): void {
    if (this.userData && this.userData.organizations[organizationIndex]) {
      // subscribe to given organization data
      this.organizationDataDoc = this.firestore.collection('organizations').doc(this.userData.organizations[organizationIndex]);
      this.organizationDataDoc.valueChanges({idField: 'id'}).pipe(takeUntil(this.organizationUnsubscribe)).subscribe(async orgData => {
        orgData?.members.sort((a) => a.userId === this.userData?.id ? -1 : 0);
        await this.loadAdditionalOrganizationData(this.organizationData, orgData);
        this.organizationData = orgData as OrganizationDataModel;
        this.organizationDataReady.next(true);
        this.organizationDataReady.complete();
      });
    } else {
      this.organizationDataReady.next(true);
      this.organizationDataReady.complete();
    }
  }

  async waitForOrganizationData(): Promise<void> {
    if (this.organizationDataReady.isStopped) {
      return;
    } else {
      await this.organizationDataReady.toPromise();
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

  getMemberName(uid: string = this.uid || ''): string {
    if (this.organizationData && this.additionalOrganizationData) {
      const idx = this.organizationData.members.findIndex(member => member.userId === uid);
      if (idx > -1) {
        return this.additionalOrganizationData.membersUsernames[idx];
      }
    }
    return 'Użytkownik';
  }

  getMemberInfo(uid = this.uid): MemberDataModel | undefined {
    return this.organizationData?.members.find(member => member.userId === uid);
  }

  getAvailabilitiesDoc(month: number, year: number): AngularFirestoreDocument<AvailabilitiesDataModel> | undefined {
    if (this.organizationData) {
      return this.firestore
        .collection('availabilities')
        .doc(this.organizationData.id)
        .collection(`${month}-${year}`)
        .doc<AvailabilitiesDataModel>(this.uid);
    } else {
      return undefined;
    }
  }

  async getAvailabilitiesDataOnce(month: number, year: number, uid = this.uid): Promise<AvailabilitiesDataModel> {
    if (uid && this.organizationData) {
      const doc = this.firestore
        .collection('availabilities')
        .doc(this.organizationData.id)
        .collection(`${month}-${year}`)
        .doc<AvailabilitiesDataModel>(uid);
      const data = (await doc.get().toPromise()).data();
      if (data) {
        return data;
      }
    }
    return {positions: [], preferredPositions: []};
  }

  get currentUserMemberInfo(): MemberDataModel | undefined {
    return this.organizationData?.members.find(member => member.userId === this.userData?.id);
  }

  get mergedMembersInfo(): MergedMemberDataModel[] {
    const res: MergedMemberDataModel[] = [];
    if (this.organizationData && this.additionalOrganizationData) {
      for (let i = 0; i < this.organizationData.members.length; i++){
        const member = this.organizationData.members[i];
        res.push({...member, username: this.additionalOrganizationData.membersUsernames[i]});
      }
    }
    return res;
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
    this.additionalOrganizationData = undefined;
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

  get username(): string {
    return this.userData?.username || 'Użytkownik';
  }

  get organizationInviteLink(): string {
    return `http://localhost:4200/organization/join?orgId=${this.organizationData?.id}`;
  }

  get defaultConfigDoc(): AngularFirestoreDocument<ConfigModel> | undefined {
    return this.organizationDataDoc?.collection('configs').doc('default');
  }

  async getDefaultConfigOnce(): Promise<ConfigModel> {
    await this.waitForOrganizationData();
    const configData = (await this.defaultConfigDoc?.get().toPromise())?.data();
    if (configData) {
      for (const [, shifts] of Object.entries(configData)) {
        for (const shift of (shifts as ConfigShiftModel[])) {
          shift.start = (shift.start as unknown as Timestamp).toDate();
          shift.end = (shift.end as unknown as Timestamp).toDate();
        }
      }
      return configData;
    }
    return {fri: [], mon: [], sat: [], sun: [], thu: [], tue: [], wed: []};
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
      if (member.role !== role && this.organizationDataDoc) {
        const batch = this.firestore.firestore.batch();
        batch.update(this.organizationDataDoc.ref, {members: firestoreUtils.FieldValue.arrayUnion({userId: member.userId, role})});
        batch.update(this.organizationDataDoc.ref, {members: firestoreUtils.FieldValue.arrayRemove(member)});
        await batch.commit();
      }
    } catch (e) {
      throw e;
    }
  }

  async removeMember(member: MemberDataModel): Promise<void> {
    try {
      if (this.organizationDataDoc) {
        const batch = this.firestore.firestore.batch();
        batch.update(this.organizationDataDoc.ref, {members: firestoreUtils.FieldValue.arrayRemove(member)});
        batch.update(this.getUserDocById(member.userId).ref, {organizations: firestoreUtils.FieldValue.arrayRemove(this.organizationData?.id)});
        await batch.commit();
        if (member.userId === this.uid) {
          this.resetOrganizationData();
        }
      }
    } catch (e) {
      throw e;
    }
  }

  async createOrganization(name: string): Promise<void> {
    try {
      if (this.uid) {
        const orgData = {
          members: [{
            userId: this.uid,
            role: 'owner'
          }], name
        };
        const orgDoc = await this.firestore.collection<OrganizationDataModel>('organizations').doc();
        const userDoc = this.getUserDocById(this.uid);

        const batch = this.firestore.firestore.batch();
        batch.set(orgDoc.ref, orgData);
        batch.update(userDoc.ref, {organizations: firestoreUtils.FieldValue.arrayUnion(orgDoc.ref.id)});
        await batch.commit();
      }
    } catch (e) {
      throw e;
    }
  }

  async addShift(day: DayShort, shift: ConfigShiftModel): Promise<void> {
    try {
      if (this.organizationDataDoc) {
        const data = {};
        // @ts-ignore
        data[day] = firestoreUtils.FieldValue.arrayUnion(shift);
        await this.organizationDataDoc.collection('configs').doc('default').update(data);
      }
    } catch (e) {
      throw e;
    }
  }

  async removeShift(day: DayShort, shift: ConfigShiftModel): Promise<void> {
    try {
      if (this.organizationDataDoc) {
        const data = {};
        // @ts-ignore
        data[day] = firestoreUtils.FieldValue.arrayRemove(shift);
        await this.organizationDataDoc.collection('configs').doc('default').update(data);
      }
    } catch (e) {
      throw e;
    }
  }

  async copyShifts(days: DayShort[], shiftsToCopy: ConfigShiftModel[]): Promise<void> {
    try {
      if (this.organizationDataDoc) {
        const defaultConfigDoc = this.organizationDataDoc.collection('configs').doc('default');
        const batch = this.firestore.firestore.batch();
        for (const day of days) {
          for (const shift of shiftsToCopy) {
            const data = {};
            // @ts-ignore
            data[day] = firestoreUtils.FieldValue.arrayUnion(shift);

            batch.update(defaultConfigDoc.ref, data);
          }
        }
        await batch.commit();
      }
    } catch (e) {
      throw e;
    }
  }

  async overwriteShifts(days: DayShort[], shiftsToCopy: ConfigShiftModel[]): Promise<void> {
    try {
      if (this.organizationDataDoc) {
        const defaultConfigDoc = this.organizationDataDoc.collection('configs').doc('default');
        const batch = this.firestore.firestore.batch();
        for (const day of days) {
          const data = {};
          // @ts-ignore
          data[day] = shiftsToCopy;

          batch.update(defaultConfigDoc.ref, data);
        }
        await batch.commit();
      }
    } catch (e) {
      throw e;
    }
  }

  async changeOrganizationName(newName: string): Promise<void> {
    try {
      if (this.organizationDataDoc && this.organizationData && this.organizationData.name !== newName) {
        await this.organizationDataDoc.update({name: newName});
      }
    } catch (e) {
      throw e;
    }
  }

  async addAvailabilityPeriod(start: string,
                              end: string,
                              date: Date,
                              availabilitiesDoc: AngularFirestoreDocument<AvailabilitiesDataModel>,
                              isPreference = false): Promise<void> {
    await this.firestore.firestore.runTransaction(async transaction => {
      const doc = await transaction.get(availabilitiesDoc.ref);
      if (doc.exists) {
        const avb = doc.data() as AvailabilitiesDataModel;
        if (isPreference) {
          avb.positions = avb.preferredPositions;
        }
        const old = avb.positions.find(pos => {
          return pos.timestamp.seconds === Timestamp.fromDate(date).seconds;
        });
        if (old) {
          const newPeriods = [];
          if (old.periods.length) {
            // We need to merge, so will find index to insert new item and keep ascending order of starts
            let id = old.periods.findIndex(p => start < p.start);
            id = id > -1 ? id : old.periods.length;
            old.periods.splice(id, 0, {start, end});
            // Then merge
            newPeriods.push(old.periods[0]);
            for (const period of old.periods.slice(1)) {
              const last = newPeriods[newPeriods.length - 1];
              if (last.end < period.start) {
                newPeriods.push(period);
              } else if (last.end < period.end) {
                last.end = period.end;
              }
            }
          } else {
            newPeriods.push({start, end});
          }
          old.periods = newPeriods;

        } else {
          avb.positions.push({
            timestamp: Timestamp.fromDate(date),
            periods: [{start, end}]
          });
        }

        const data = isPreference ? {preferredPositions: avb.positions} : {positions: avb.positions};
        transaction.update(availabilitiesDoc.ref, data);
      } else {
        const data: AvailabilitiesDataModel = {positions: [], preferredPositions: []};
        const position = {
          timestamp: Timestamp.fromDate(date),
          periods: [{start, end}]
        };
        if (isPreference) {
          data.preferredPositions.push(position);
        } else {
          data.positions.push(position);
        }
        transaction.set(availabilitiesDoc.ref, data);
      }
    });
  }

  async removeAvailabilityPeriod(period: AvailabilityPeriod,
                                 date: Date, availabilitiesDoc: AngularFirestoreDocument<AvailabilitiesDataModel>,
                                 isPreference = false): Promise<void> {
    await this.firestore.firestore.runTransaction(async transaction => {
      const doc = await transaction.get(availabilitiesDoc.ref);
      if (doc.exists) {
        const avb = doc.data() as AvailabilitiesDataModel;
        if (isPreference) {
          avb.positions = avb.preferredPositions;
        }
        const position = avb.positions.find(pos => {
          return pos.timestamp.seconds === Timestamp.fromDate(date).seconds;
        });
        if (position) {
          if (!isPreference) {
            const prefPosition = avb.preferredPositions.find(pos => {
              return pos.timestamp.seconds === Timestamp.fromDate(date).seconds;
            });
            if (prefPosition) {
              prefPosition.periods = prefPosition.periods.filter(p => {
                return (p.start < period.start && p.end <= period.start) || (p.start > period.end && p.end > period.end);
              });
            }
          }
          position.periods = position.periods.filter(p => p.start !== period.start || p.end !== period.end);
          const data = isPreference ? {preferredPositions: avb.positions} : avb;
          transaction.update(availabilitiesDoc.ref, data);
        }
      }
    });
  }


}
