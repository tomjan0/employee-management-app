import {AvailabilityPeriod} from './availabilities-data.model';
import {MemberDataModel} from './organization-data.model';

export interface ScheduleData {
  scheduledShifts: ScheduleShift[][];
}

export interface ScheduleShift {
  userId: string;
  period: AvailabilityPeriod;
}

export interface UserScheduledShifts {
  assignee: ScheduleMemberData;
  shifts: AvailabilityPeriod[][];
  helper: {
    availabilityClasses: string[];
  };
}

export interface ScheduleMemberData extends MemberDataModel {
  username: string;
  availabilities: {
    periods: AvailabilityPeriod[];
    preferredPeriods: AvailabilityPeriod[];
  }[];
  hours: number;
}
