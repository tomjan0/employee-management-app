import {AvailabilityPeriod} from './availabilities-data.model';
import {MemberDataModel} from './organization-data.model';

export interface ScheduleData {
  scheduledShifts: ScheduleShift[][];
}

export interface ScheduleShift {
  userId: string;
  period: AvailabilityPeriod;
}

export interface ScheduleUserEntry {
  assignee: ScheduleMemberData;
  shifts: AvailabilityPeriod[][];
  helper: {
    availabilityClasses: string[];
    shiftsClasses: Map<string, string>[];
  };
}

export interface SavedScheduleUserEntry {
  assignee: string;
  shifts: {
    dayNumber: number;
    periods: AvailabilityPeriod[];
  }[];
}

export interface SavedSchedule {
  entries: SavedScheduleUserEntry[];
}


export interface ScheduleMemberData extends MemberDataModel {
  username: string;
  availabilities: {
    periods: AvailabilityPeriod[];
    preferredPeriods: AvailabilityPeriod[];
  }[];
  hours: number;
  minHours?: number;
  maxHours?: number;
}
