import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const shouldFallbackToRedirect = (errorCode?: string) => {
  return errorCode === 'auth/popup-blocked' || errorCode === 'auth/web-storage-unsupported';
};

export const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Authentication. Add localhost to Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is disabled in Firebase Authentication. Enable Google provider in the Firebase console.';
    case 'auth/network-request-failed':
      return 'Network error while contacting Firebase. Check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completion.';
    default:
      return 'Google sign-in failed. Please try again.';
  }
};

export const signInWithGoogle = async () => {
  await setPersistence(auth, browserLocalPersistence);

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    const errorCode =
      typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : undefined;

    if (shouldFallbackToRedirect(errorCode)) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
