import firebase from 'firebase';
import Timestamp = firebase.firestore.Timestamp;

type requestState = 'pending' | 'accepted' | 'declined';

export interface OrganizationMembershipRequestModel {
  requestTime: Timestamp;
  userId: string;
  organizationId: string;
  status: requestState;
  id?: string;
}
