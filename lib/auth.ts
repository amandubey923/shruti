import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './firebase';
import { UserProfile } from '@/types/user';

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is pending. Please configure your .env keys.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  if (result.user) {
    await syncUserRecord(result.user);
  }
  return result.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is pending. Please configure your .env keys.');
  }
  const result = await signInWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    await syncUserRecord(result.user);
  }
  return result.user;
}

export async function signUpWithEmail(email: string, pass: string, displayName?: string): Promise<FirebaseUser | null> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is pending. Please configure your .env keys.');
  }
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  if (result.user) {
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    await syncUserRecord(result.user, displayName);
  }
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (!isFirebaseConfigured) return;
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase configuration is pending.');
  }
  await sendPasswordResetEmail(auth, email);
}

export async function syncUserRecord(user: FirebaseUser, explicitName?: string): Promise<void> {
  if (!isFirebaseConfigured || !user) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userDocRef);
    const now = new Date().toISOString();
    
    if (!existing.exists()) {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: explicitName || user.displayName || 'Listener',
        photoURL: user.photoURL || null,
        theme: 'dark',
        preferredSpeed: 1,
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userDocRef, newProfile);
    } else {
      await setDoc(
        userDocRef,
        {
          email: user.email,
          displayName: explicitName || user.displayName || existing.data().displayName,
          photoURL: user.photoURL || existing.data().photoURL,
          updatedAt: now,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Error syncing user record to Firestore:', err);
  }
}

export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

