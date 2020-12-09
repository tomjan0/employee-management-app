import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import UserDataModel from '../../shared/models/user-data.model';
import {OrganizationDataModel} from '../../shared/models/organization-data.model';
import {Observable, Subject} from 'rxjs';
import {AvailabilitiesDataModel} from '../../shared/models/availabilities-data.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userDataObs: Observable<unknown> | undefined = undefined;
  organizationData: OrganizationDataModel | undefined = undefined;
  organizationDataDoc: AngularFirestoreDocument<OrganizationDataModel> | undefined = undefined;
  uid = '';
  dataReady = new Subject<boolean>();

  constructor(private firestore: AngularFirestore) {
  }

  getLocal(key: string): string | null {
    return localStorage.getItem(key);
  }

  setLocal(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  getAvailabilitiesDoc(month: number = 12, year: number = 2020): AngularFirestoreDocument<AvailabilitiesDataModel> | undefined {
    if (this.organizationData) {
      return this.firestore
        .collection('availabilities')
        .doc(this.organizationData.id)
        .collection<AvailabilitiesDataModel>(`${month}-${year}`)
        .doc<AvailabilitiesDataModel>(this.uid);
    } else {
      return undefined;
    }
  }


  loadUserData(uid: string): void {
    this.uid = uid;
    this.userDataObs = this.firestore.collection('users').doc<UserDataModel>(uid).valueChanges();
    this.userDataObs.subscribe(userData => {
      const data = userData as UserDataModel;
      this.organizationDataDoc = this.firestore.collection('organizations').doc(data.organizations[0]);
      this.organizationDataDoc.valueChanges({idField: 'id'}).subscribe(orgData => {
        this.organizationData = orgData as OrganizationDataModel;
        this.dataReady.next(true);
        this.dataReady.complete();
      });
    });
  }

  get organizationName(): string | undefined {
    return this.organizationData?.name;
  }

}
