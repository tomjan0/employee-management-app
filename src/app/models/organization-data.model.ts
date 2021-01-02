import {MemberRole} from '../core/types/custom.types';

export interface OrganizationDataModel {
  members: MemberDataModel[];
  name: string;
  id?: string;
}

export interface MemberDataModel {
  userId: string;
  role: MemberRole;
}

export interface MergedMemberDataModel {
  userId: string;
  role: MemberRole;
  username: string;
}
