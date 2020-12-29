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
  start: Date;
  end: Date;
  name: string;
  minEmployees: number;
  maxEmployees: number;
}

export interface ConfigShiftDialogModel {
  start: string;
  end: string;
  name?: string;
  minEmployees: number;
  maxEmployees: number;
}

export interface ConfigExceptionShift {
  date: Date;
  shifts: ConfigShiftModel[];
}
