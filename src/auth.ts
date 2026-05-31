import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { DEFAULT_USER } from './data';
import { auth, db, googleProvider } from './firebase';
import { UserProfile } from './types';

const usersCollection = 'users';

function getUserRef(uid: string) {
  return doc(db, usersCollection, uid);
}

function createDefaultProfile(uid: string, googleUser?: User): UserProfile {
  return {
    ...DEFAULT_USER,
    id: uid,
    name: googleUser?.displayName ?? DEFAULT_USER.name,
    avatar: googleUser?.photoURL ?? DEFAULT_USER.avatar,
  };
}

async function getOrCreateUserProfile(uid: string, googleUser?: User): Promise<UserProfile> {
  const userRef = getUserRef(uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  const profile = createDefaultProfile(uid, googleUser);
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

      onChange(await getOrCreateUserProfile(firebaseUser.uid, firebaseUser));
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Firebase authentication failed.'));
    }
  });
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const credential = await signInWithPopup(auth, googleProvider);
  return getOrCreateUserProfile(credential.user.uid, credential.user);
}

export async function updateCurrentUser(updatedUser: UserProfile): Promise<void> {
  await setDoc(getUserRef(updatedUser.id), {
    ...updatedUser,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetDemoUser(currentUserId: string): Promise<UserProfile> {
  const user = createDefaultProfile(currentUserId);
  await updateCurrentUser(user);
  return user;
}
