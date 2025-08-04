import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    let serviceAccount: {
      type: string;
      project_id: string;
      private_key_id: string;
      private_key: string;
      client_email: string;
      client_id: string;
      auth_uri?: string;
      token_uri?: string;
      auth_provider_x509_cert_url?: string;
      client_x509_cert_url: string;
      universe_domain?: string;
    };

    // Check if we're on Heroku (using environment variables)
    if (process.env.FIREBASE_PROJECT_ID) {
      serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri:
          process.env.FIREBASE_AUTH_URI ||
          'https://accounts.google.com/o/oauth2/auth',
        token_uri:
          process.env.FIREBASE_TOKEN_URI ||
          'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url:
          process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL ||
          'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain:
          process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
      };
    } else {
      // Use local firebase.json file
      const serviceAccountPath = path.join(process.cwd(), 'firebase.json');
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });
  }
  return admin;
};

export const getFirestore = () => {
  return admin.firestore();
};

export const getAuth = () => {
  return admin.auth();
};
