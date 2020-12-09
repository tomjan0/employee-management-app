import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export interface AvailabilitiesDataModel {
  positions: AvailabilitiesPositionDataModel[];
}

interface AvailabilitiesPositionDataModel {
  timestamp: Timestamp;
  shifts: number[];
}
