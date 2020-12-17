export interface OrganizationDataModel {
  members: MemberDataModel[];
  name: string;
  id?: string;
}

export interface MemberDataModel {
  userId: string;
  role: 'owner' | 'manager' | 'member';
}
