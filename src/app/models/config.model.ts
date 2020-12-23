import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

export default interface ConfigModel {
  mon: ConfigShiftModel[];
  tue: ConfigShiftModel[];
  wed: ConfigShiftModel[];
  thu: ConfigShiftModel[];
  fri: ConfigShiftModel[];
  sat: ConfigShiftModel[];
  sun: ConfigShiftModel[];
}

export interface ConfigShiftModel {
  start: Date | Timestamp;
  end: Date | Timestamp;
  name?: string;
  minEmployees: number;
  maxEmployees: number;
}
