import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { DEFAULT_USER } from './data';
import { auth, db } from './firebase';
import { UserProfile } from './types';

const usersCollection = 'users';

function getUserRef(uid: string) {
  return doc(db, usersCollection, uid);
}

function createDefaultProfile(uid: string): UserProfile {
  return {
    ...DEFAULT_USER,
    id: uid
  };
}

async function getOrCreateUserProfile(uid: string): Promise<UserProfile> {
  const userRef = getUserRef(uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  const profile = createDefaultProfile(uid);
  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return profile;
}

export function subscribeToCurrentUser(
  onChange: (user: UserProfile | null) => void,
  onError: (error: Error) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        onChange(null);
        return;
      }

      onChange(await getOrCreateUserProfile(firebaseUser.uid));
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Firebase authentication failed.'));
    }
  });
}

export async function signInDemoUser(): Promise<UserProfile> {
  const credential = await signInAnonymously(auth);
  return getOrCreateUserProfile(credential.user.uid);
}

export async function updateCurrentUser(updatedUser: UserProfile): Promise<void> {
  await setDoc(getUserRef(updatedUser.id), {
    ...updatedUser,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function resetDemoUser(currentUserId: string): Promise<UserProfile> {
  const user = createDefaultProfile(currentUserId);
  await updateCurrentUser(user);
  return user;
}
