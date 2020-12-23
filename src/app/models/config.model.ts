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
  name?: string;
  minEmployees: number;
  maxEmployees: number;
}
