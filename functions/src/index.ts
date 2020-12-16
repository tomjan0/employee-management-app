import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();
const firestore = admin.firestore();

export const membershipRequestTrigger = functions.region('europe-west3')
  .firestore.document('membership-requests/{requestId}').onUpdate(async change => {
    const updatedRequest = change.after.data();
    if (updatedRequest.status === 'accepted') {
      try {
        await firestore
          .doc(`users/${updatedRequest.userId}`)
          .update({organizations: admin.firestore.FieldValue.arrayUnion(updatedRequest.organizationId)});

        await firestore
          .doc(`organizations/${updatedRequest.organizationId}`)
          .update({members: admin.firestore.FieldValue.arrayUnion(updatedRequest.userId)});
      } catch (e) {
        functions.logger.error(e);
        await change.after.ref.update({status: 'pending'});
      }
    }
  });
