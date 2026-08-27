import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const metaEnv = (import.meta as any).env || {};

export const isFirebaseConfigured = (): boolean => {
  const apiKey = metaEnv.VITE_FIREBASE_API_KEY;
  const projectId = metaEnv.VITE_FIREBASE_PROJECT_ID;
  const appId = metaEnv.VITE_FIREBASE_APP_ID;

  return Boolean(
    apiKey &&
    typeof apiKey === 'string' &&
    apiKey.trim() !== '' &&
    !apiKey.includes('dummy') &&
    !apiKey.includes('your-') &&
    projectId &&
    !projectId.includes('dummy') &&
    appId &&
    !appId.includes('dummy')
  );
};

export const getMissingFirebaseKeys = (): string[] => {
  const required = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  return required.filter((key) => {
    const val = metaEnv[key];
    return !val || typeof val !== 'string' || val.trim() === '' || val.includes('dummy');
  });
};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "dummy-api-key-to-prevent-boot-crash-sahaaya-ai",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "dummy-project.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "dummy-project",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "dummy-project.appspot.com",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

