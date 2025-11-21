const admin = require('firebase-admin');

const initializeFirebase = () => {
  try {
    // Skip Firebase initialization if credentials are not provided
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('Firebase credentials not provided - skipping Firebase initialization');
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase Admin initialized');
    }
    return admin;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

module.exports = { initializeFirebase };
