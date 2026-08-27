import admin from 'firebase-admin';

let adminApp: any = null;

export function getFirebaseAdmin(): any {
  if (adminApp) return adminApp;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  try {
    if (projectId && clientEmail && privateKey) {
      adminApp = (admin as any).initializeApp({
        credential: (admin as any).credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully using service account.');
    } else {
      console.warn('Firebase Admin env vars not fully configured. Using JWT decode fallback mode.');
      return null;
    }
    return adminApp;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    return null;
  }
}

export function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // Safe base64url to base64 conversion
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const payload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

export async function verifyIdToken(token: string): Promise<{ uid: string; phoneNumber: string } | null> {
  const firebaseAdmin = getFirebaseAdmin();
  if (firebaseAdmin) {
    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      return {
        uid: decodedToken.uid,
        phoneNumber: decodedToken.phone_number || '',
      };
    } catch (e: any) {
      console.warn('Firebase Admin token verification failed, checking token decode fallback:', e.message);
    }
  }

  const decoded = decodeJWT(token);
  if (decoded) {
    return {
      uid: decoded.sub || decoded.uid || decoded.user_id || '',
      phoneNumber: decoded.phone_number || decoded.phoneNumber || '',
    };
  }

  return null;
}
