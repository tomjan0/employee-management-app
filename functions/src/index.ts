import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
admin.initializeApp();
const firestore = admin.firestore();

export const membershipRequestUpdatedTrigger = functions
  .region('europe-west3')
  .firestore
  .document('membership-requests/{requestId}')
  .onUpdate(async change => {
    const updatedRequest = change.after.data();
    if (updatedRequest.status === 'accepted') {
      try {
        await firestore
          .doc(`users/${updatedRequest.userId}`)
          .update({organizations: admin.firestore.FieldValue.arrayUnion(updatedRequest.organizationId)});

        await firestore
          .doc(`organizations/${updatedRequest.organizationId}`)
          .update({members: admin.firestore.FieldValue.arrayUnion({userId: updatedRequest.userId, role: 'member'})});
      } catch (e) {
        functions.logger.error(e);
        await change.after.ref.update({status: 'pending'});
      }
    }
  });

export const userUpdatedTrigger = functions
  .region('europe-west3')
  .firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const updatedRequest = change.after.data();
    try {
      await firestore
        .doc(`public-user-data/${context.params.userId}`)
        .update({username: updatedRequest.username});
    } catch (e) {
      functions.logger.error(e);
    }
  });

export const userCreatedTrigger = functions
  .region('europe-west3')
  .firestore
  .document('users/{userId}')
  .onCreate(async (change, context) => {
    const updatedRequest = change.data();
    try {
      await firestore
        .doc(`public-user-data/${context.params.userId}`)
        .create({username: updatedRequest.username});
    } catch (e) {
      functions.logger.error(e);
    }
  });

export const userDeletedTrigger = functions
  .region('europe-west3')
  .firestore
  .document('users/{userId}')
  .onDelete(async (change, context) => {
    try {
      await firestore
        .doc(`public-user-data/${context.params.userId}`)
        .delete();
    } catch (e) {
      functions.logger.error(e);
    }
  });

export const organizationDeletedTrigger = functions
  .region('europe-west3')
  .firestore
  .document('organizations/{orgId}')
  .onDelete(async (change, context) => {
    try {
      await firestore
        .doc(`availabilities/${context.params.orgId}`)
        .delete();
    } catch (e) {
      functions.logger.error(e);
    }
  });

export const authUserDeletedTrigger = functions
  .region('europe-west3')
  .auth
  .user()
  .onDelete(async user => {
    try {
      const userDataDoc = firestore.doc(`users/${user.uid}`);
      const userData = (await userDataDoc.get()).data();
      if (userData?.organizations) {
        for (const orgId of userData?.organizations) {
          const orgDoc = firestore.doc(`organizations/${orgId}`);
          const orgData = (await orgDoc.get()).data();
          const userOrgData = orgData?.members.find((member: any) => member.userId === user.uid);
          if (userOrgData?.role === 'owner') {
            await orgDoc.delete();
          }
        }
      }
      await userDataDoc.delete();
    } catch (e) {
      functions.logger.error(e);
    }
  });
