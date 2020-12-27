import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;

export interface AvailabilitiesDataModel {
  positions: AvailabilitiesPositionDataModel[];
  preferredPositions: AvailabilitiesPositionDataModel[];
}

interface AvailabilitiesPositionDataModel {
  timestamp: Timestamp;
  periods: AvailabilityPeriod[];
}

export interface AvailabilityPeriod {
  start: string;
  end: string;
}
