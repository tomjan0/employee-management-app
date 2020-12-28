import firebase from 'firebase/app';
import Timestamp = firebase.firestore.Timestamp;
import {MemberRole} from '../core/types/custom.types';

export interface AvailabilitiesDataModel {
  positions: AvailabilitiesPositionDataModel[];
  preferredPositions: AvailabilitiesPositionDataModel[];
}

interface AvailabilitiesPositionDataModel {
  timestamp: Timestamp;
  periods: AvailabilityPeriod[];
}

export interface LocalAvailabilitiesPositionDataModel {
  date: Date;
  periods: AvailabilityPeriod[];
  preferredPeriods: AvailabilityPeriod[];
  past?: boolean;
}

export interface AvailabilityViewData {
  username: string;
  role: MemberRole | '';
  positions: LocalAvailabilitiesPositionDataModel[];
}

export interface AvailabilityPeriod {
  start: string;
  end: string;
}
