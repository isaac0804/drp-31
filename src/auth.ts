import { DEFAULT_USER } from './data';
import { UserProfile } from './types';

const AUTH_USER_STORAGE_KEY = 'smash_auth_user';

export function getCurrentUser(): UserProfile | null {
  const cachedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!cachedUser) {
    return null;
  }

  try {
    return JSON.parse(cachedUser) as UserProfile;
  } catch (e) {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
}

export function signInDemoUser(): UserProfile {
  const existingUser = getCurrentUser();
  const user = existingUser ?? DEFAULT_USER;
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function updateCurrentUser(updatedUser: UserProfile): void {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(updatedUser));
}

export function resetDemoUser(): UserProfile {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
  return DEFAULT_USER;
}
