import * as admin from 'firebase-admin';

interface FirebaseServiceAccount {
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
}

const createServiceAccountFromEnv = (): FirebaseServiceAccount => {
  // Validate required environment variables
  const requiredVars = [
    'FIREBASE_TYPE',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}`,
    );
  }

  // Handle private key format
  let privateKey = process.env.FIREBASE_PRIVATE_KEY!;

  // Replace escaped newlines with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Validate PEM format
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('FIREBASE_PRIVATE_KEY must be in PEM format');
  }

  return {
    type: process.env.FIREBASE_TYPE!,
    project_id: process.env.FIREBASE_PROJECT_ID!,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
    private_key: privateKey,
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    client_id: process.env.FIREBASE_CLIENT_ID!,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
  };
};

export const initializeFirebase = () => {
  if (!admin.apps.length) {
    try {
      const serviceAccount = createServiceAccountFromEnv();

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      });

      console.log(
        `✅ Firebase initialized for project: ${serviceAccount.project_id}`,
      );
    } catch (error) {
      console.error('❌ Failed to initialize Firebase:', error);
      throw error;
    }
  }
  return admin;
};

export const getFirestore = () => {
  return admin.firestore();
};

export const getAuth = () => {
  return admin.auth();
};
