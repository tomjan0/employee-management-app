import {Injectable} from '@angular/core';
import {DataService} from '../../../core/services/data.service';
import {AngularFirestore} from '@angular/fire/firestore';
import ConfigModel, {ConfigExceptionShift} from '../../../models/config.model';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  firestore: AngularFirestore;
  schedules: string[] = [];

  constructor(private dataService: DataService) {
    this.firestore = this.dataService.getFirestore();

    this.loadSchedules();
  }

  async loadSchedules(): Promise<void> {
    await this.dataService.waitForOrganizationData();
    if (this.dataService.organizationData) {
      this.firestore.collection('schedules').doc<{ schedules: string [] }>(this.dataService.organizationData.id).valueChanges().subscribe(next => {
        this.schedules = next?.schedules || [];
      });
    }
  }


  async createNewSchedule(month: number, year: number, config: ConfigModel, exceptions: ConfigExceptionShift[]): Promise<void> {
    console.log(month, year, config, exceptions);
    if (this.dataService.organizationData) {
      const schedulesDoc = this.firestore.collection('schedules').doc(this.dataService.organizationData.id);
      await schedulesDoc.update({schedules: this.dataService.utils.FieldValue.arrayUnion(`${month}-${year}`)});
      await schedulesDoc.collection(`${month}-${year}`).doc('config').set({...config, exceptions});
    }
  }

  getDefaultConfigOnce(): Promise<ConfigModel> {
    return this.dataService.getDefaultConfigOnce();
  }
}
