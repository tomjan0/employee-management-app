import {AvailabilityPeriod} from './availabilities-data.model';
import {MergedMemberDataModel} from './organization-data.model';

export interface ScheduleData {
  scheduledShifts: ScheduleShift[][];
}

export interface ScheduleShift {
  userId: string;
  period: AvailabilityPeriod;
}

export interface UserScheduledShifts {
  assignee: MergedMemberDataModel;
  shifts: AvailabilityPeriod[][];
}
