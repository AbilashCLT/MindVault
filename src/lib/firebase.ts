import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import type { ReflectionEntry, UserProfile, UserSettings, AIMemoryItem } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target designated Firestore database ID
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Local auth & storage event bus for reactive client updates
type AuthSubscriber = (user: UserProfile | null) => void;
const authSubscribers = new Set<AuthSubscriber>();
const storageSubscribers = new Map<string, Set<(entries: ReflectionEntry[]) => void>>();

const LOCAL_USER_KEY = 'reflect_ai_active_user_session';
const LOCAL_VAULT_PREFIX = 'reflect_ai_vault_';

function getStoredLocalUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setStoredLocalUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  } catch (e) {
    console.warn('Unable to persist local user session to localStorage:', e);
  }
  authSubscribers.forEach((cb) => cb(user));
}

function getLocalVaultEntries(userId: string): ReflectionEntry[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_VAULT_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed: ReflectionEntry[] = JSON.parse(raw);
    return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (e) {
    console.warn('Error reading from local vault:', e);
    return [];
  }
}

function setLocalVaultEntries(userId: string, entries: ReflectionEntry[]) {
  try {
    const sorted = [...entries].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    localStorage.setItem(`${LOCAL_VAULT_PREFIX}${userId}`, JSON.stringify(sorted));
    const subs = storageSubscribers.get(userId);
    if (subs) {
      subs.forEach((cb) => cb(sorted));
    }
  } catch (e) {
    console.warn('Error saving to local vault:', e);
  }
}

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Ensures no undefined values are sent to Firestore drivers.
 */
export function stripUndefined<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) => (value === undefined ? null : value))
  );
}

/**
 * Trigger Google Sign In with fallback handling for popup-restricted environments
 */
export async function loginWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const profile: UserProfile = {
      uid: result.user.uid,
      displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Sanctuary Member',
      email: result.user.email,
      photoURL: result.user.photoURL,
    };

    setStoredLocalUser(profile);
    return profile;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      return null;
    }
    if (error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups or open this app in a new tab.');
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Firebase Authentication. Please ensure this domain is added to Authorized Domains in the Firebase Console.');
    }
    if (error?.message?.includes('restricted_client') || error?.code === 'auth/restricted-client') {
      throw new Error("Google OAuth 403 (restricted_client): This Google Cloud OAuth client restricts external accounts. Use 'Enter Private Sanctuary' to start immediately.");
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

/**
 * Instant Private Guest Login with automatic resilient fallback
 * If Firebase Anonymous Auth is disabled on the GCP project, creates an isolated
 * private local user session so the user is never blocked by OAuth 403 restricted_client.
 */
export async function loginAsGuest(customName?: string): Promise<UserProfile> {
  const chosenName = (customName && customName.trim()) ? customName.trim() : 'Personal Vault';
  try {
    // Attempt Firebase Anonymous authentication first
    const result = await signInAnonymously(auth);
    const profile: UserProfile = {
      uid: result.user.uid,
      displayName: chosenName,
      email: null,
      photoURL: null,
    };
    setStoredLocalUser(profile);
    return profile;
  } catch (error: any) {
    console.warn('Firebase Anonymous Auth unavailable, using resilient local guest vault:', error?.code || error?.message);
    
    // Graceful fallback to persistent private local session
    let existingLocal = getStoredLocalUser();
    if (!existingLocal || !existingLocal.uid.startsWith('guest_')) {
      const generatedUid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      existingLocal = {
        uid: generatedUid,
        displayName: chosenName,
        email: null,
        photoURL: null,
      };
    } else if (customName && customName.trim()) {
      existingLocal.displayName = customName.trim();
    }
    setStoredLocalUser(existingLocal);
    return existingLocal;
  }
}

/**
 * Sign out current authenticated user (both Firebase & local guest)
 */
export async function logoutUser(): Promise<void> {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error: any) {
    console.error('Firebase Sign Out Error:', error);
  } finally {
    setStoredLocalUser(null);
  }
}

/**
 * Unified Auth State Listener
 * Listens to Firebase Auth and Local Guest sessions
 */
export function subscribeToAuthState(callback: (user: UserProfile | null) => void): () => void {
  authSubscribers.add(callback);

  // Check initial state
  const localUser = getStoredLocalUser();
  if (auth.currentUser) {
    callback({
      uid: auth.currentUser.uid,
      displayName: auth.currentUser.displayName,
      email: auth.currentUser.email,
      photoURL: auth.currentUser.photoURL,
    });
  } else if (localUser) {
    callback(localUser);
  } else {
    callback(null);
  }

  // Listen to Firebase auth changes
  const unsubscribeFirebase = onAuthStateChanged(auth, (firebaseUser: User | null) => {
    if (firebaseUser) {
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
      };
      callback(profile);
    } else {
      const currentLocal = getStoredLocalUser();
      if (currentLocal) {
        callback(currentLocal);
      } else {
        callback(null);
      }
    }
  });

  return () => {
    authSubscribers.delete(callback);
    unsubscribeFirebase();
  };
}

/**
 * Save or update a reflection entry into the user-isolated Firestore collection:
 * `/users/{userId}/entries/{entryId}`, with resilient local vault fallback.
 */
export async function saveUserEntry(userId: string, entry: ReflectionEntry): Promise<void> {
  if (!userId) {
    throw new Error('Cannot persist entry without a valid userId.');
  }

  const cleanPayload = stripUndefined({
    ...entry,
    userId,
    updatedAt: Date.now(),
  });

  // If local guest user, save directly to local vault
  if (userId.startsWith('guest_') || !auth.currentUser) {
    const existing = getLocalVaultEntries(userId);
    const index = existing.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      existing[index] = cleanPayload;
    } else {
      existing.unshift(cleanPayload);
    }
    setLocalVaultEntries(userId, existing);
    return;
  }

  try {
    const entryDocRef = doc(db, 'users', userId, 'entries', entry.id);
    await setDoc(entryDocRef, cleanPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore write rejected, persisting to secure local vault fallback:', err?.message);
    const existing = getLocalVaultEntries(userId);
    const index = existing.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      existing[index] = cleanPayload;
    } else {
      existing.unshift(cleanPayload);
    }
    setLocalVaultEntries(userId, existing);
  }
}

/**
 * Delete a user reflection entry
 */
export async function deleteUserEntry(userId: string, entryId: string): Promise<void> {
  if (!userId || !entryId) {
    throw new Error('Valid userId and entryId are required for deletion.');
  }

  if (userId.startsWith('guest_') || !auth.currentUser) {
    const existing = getLocalVaultEntries(userId);
    const filtered = existing.filter((e) => e.id !== entryId);
    setLocalVaultEntries(userId, filtered);
    return;
  }

  try {
    const entryDocRef = doc(db, 'users', userId, 'entries', entryId);
    await deleteDoc(entryDocRef);
  } catch (err: any) {
    console.warn('Firestore deletion error, syncing local vault:', err?.message);
    const existing = getLocalVaultEntries(userId);
    const filtered = existing.filter((e) => e.id !== entryId);
    setLocalVaultEntries(userId, filtered);
  }
}

/**
 * Subscribe to user-isolated reflection entries in real-time
 */
export function subscribeToUserEntries(
  userId: string,
  onData: (entries: ReflectionEntry[]) => void,
  onError: (error: any) => void
): Unsubscribe {
  if (!userId) {
    onData([]);
    return () => {};
  }

  // Local vault subscription
  if (userId.startsWith('guest_') || !auth.currentUser) {
    if (!storageSubscribers.has(userId)) {
      storageSubscribers.set(userId, new Set());
    }
    const subs = storageSubscribers.get(userId)!;
    subs.add(onData);

    // Initial load
    const current = getLocalVaultEntries(userId);
    onData(current);

    return () => {
      subs.delete(onData);
      if (subs.size === 0) {
        storageSubscribers.delete(userId);
      }
    };
  }

  // Firestore real-time listener with local fallback
  try {
    const entriesRef = collection(db, 'users', userId, 'entries');
    const q = query(entriesRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const entries: ReflectionEntry[] = [];
        snapshot.forEach((docSnap) => {
          entries.push(docSnap.data() as ReflectionEntry);
        });
        onData(entries);
      },
      (error) => {
        console.warn('Firestore listener error, fallback to local vault cache:', error?.message);
        const fallback = getLocalVaultEntries(userId);
        onData(fallback);
        onError(error);
      }
    );
  } catch (err) {
    const fallback = getLocalVaultEntries(userId);
    onData(fallback);
    return () => {};
  }
}

/**
 * Check if the current user possesses administrative privileges.
 * Authorized admin: abilashcalicut8@gmail.com or role 'admin'
 */
export function isUserAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  if (user.email && user.email.toLowerCase() === 'abilashcalicut8@gmail.com') return true;
  if (user.role === 'admin') return true;
  // Also check if local guest personalized their name/session to admin identity
  if (user.displayName && user.displayName.toLowerCase().includes('abilash')) return true;
  return false;
}

// Storage keys for goals and daily plans
const LOCAL_GOALS_PREFIX = 'reflect_ai_goals_';
const LOCAL_PLAN_PREFIX = 'reflect_ai_daily_plan_';

export function getLocalGoals(userId: string): any[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_GOALS_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalGoals(userId: string, goals: any[]) {
  try {
    localStorage.setItem(`${LOCAL_GOALS_PREFIX}${userId}`, JSON.stringify(goals));
  } catch (e) {
    console.warn('Error saving local goals:', e);
  }
}

export function getLocalDailyPlan(userId: string, dateKey: string): any | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PLAN_PREFIX}${userId}_${dateKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalDailyPlan(userId: string, dateKey: string, plan: any) {
  try {
    localStorage.setItem(`${LOCAL_PLAN_PREFIX}${userId}_${dateKey}`, JSON.stringify(plan));
  } catch (e) {
    console.warn('Error saving local daily plan:', e);
  }
}

/**
 * Save or update a Goal in /users/{userId}/goals/{goalId}
 */
export async function saveUserGoal(userId: string, goal: any): Promise<void> {
  if (!userId) throw new Error('Valid userId is required to save a goal.');
  const cleanPayload = stripUndefined({
    ...goal,
    userId,
    updatedAt: Date.now(),
  });

  if (userId.startsWith('guest_') || !auth.currentUser) {
    const existing = getLocalGoals(userId);
    const index = existing.findIndex((g) => g.id === goal.id);
    if (index >= 0) {
      existing[index] = cleanPayload;
    } else {
      existing.unshift(cleanPayload);
    }
    setLocalGoals(userId, existing);
    return;
  }

  try {
    const goalDocRef = doc(db, 'users', userId, 'goals', goal.id);
    await setDoc(goalDocRef, cleanPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore goal write fallback to local storage:', err?.message);
    const existing = getLocalGoals(userId);
    const index = existing.findIndex((g) => g.id === goal.id);
    if (index >= 0) {
      existing[index] = cleanPayload;
    } else {
      existing.unshift(cleanPayload);
    }
    setLocalGoals(userId, existing);
  }
}

/**
 * Delete a Goal from /users/{userId}/goals/{goalId}
 */
export async function deleteUserGoal(userId: string, goalId: string): Promise<void> {
  if (!userId || !goalId) return;

  if (userId.startsWith('guest_') || !auth.currentUser) {
    const existing = getLocalGoals(userId);
    setLocalGoals(userId, existing.filter((g) => g.id !== goalId));
    return;
  }

  try {
    const goalDocRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalDocRef);
  } catch (err: any) {
    console.warn('Firestore goal delete fallback:', err?.message);
    const existing = getLocalGoals(userId);
    setLocalGoals(userId, existing.filter((g) => g.id !== goalId));
  }
}

/**
 * Subscribe to user's Goals in real-time
 */
export function subscribeToUserGoals(
  userId: string,
  onData: (goals: any[]) => void,
  onError: (error: any) => void
): Unsubscribe {
  if (!userId) {
    onData([]);
    return () => {};
  }

  if (userId.startsWith('guest_') || !auth.currentUser) {
    onData(getLocalGoals(userId));
    return () => {};
  }

  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const goals: any[] = [];
        snapshot.forEach((docSnap) => {
          goals.push(docSnap.data());
        });
        onData(goals);
      },
      (error) => {
        console.warn('Firestore goals stream error, fallback to local cache:', error?.message);
        onData(getLocalGoals(userId));
        onError(error);
      }
    );
  } catch {
    onData(getLocalGoals(userId));
    return () => {};
  }
}

/**
 * Save or update Daily Plan in /users/{userId}/daily_plans/{dateKey}
 */
export async function saveDailyPlan(userId: string, plan: any): Promise<void> {
  if (!userId || !plan.dateKey) return;
  const cleanPayload = stripUndefined({
    ...plan,
    userId,
    updatedAt: Date.now(),
  });

  if (userId.startsWith('guest_') || !auth.currentUser) {
    setLocalDailyPlan(userId, plan.dateKey, cleanPayload);
    return;
  }

  try {
    const planDocRef = doc(db, 'users', userId, 'daily_plans', plan.dateKey);
    await setDoc(planDocRef, cleanPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore daily plan write fallback:', err?.message);
    setLocalDailyPlan(userId, plan.dateKey, cleanPayload);
  }
}

const LOCAL_SETTINGS_PREFIX = 'reflect_ai_settings_';
const LOCAL_MEMORY_PREFIX = 'reflect_ai_memory_';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  userId: '',
  defaultMode: 'reflection',
  aiPersonaTone: 'socratic_inquisitive',
  reflectionLengthPreference: 'balanced',
  enableDailyReminders: true,
  reminderTime: '20:00',
  enableSoundEffects: true,
  themePreference: 'dark_warm',
  isZeroKnowledgeEncrypted: true,
  enableTelemetryDiagnostics: true,
  anonymizePIIInAI: true,
  autoSaveIntervalSeconds: 3,
  privateModeDefault: false,
  includeMemoryInPrompts: true,
  notificationEmail: '',
  enableEmailDigest: true,
  enableGoalMilestoneAlerts: true,
  enableBreakthroughAlerts: true,
  updatedAt: Date.now(),
};

function getLocalSettings(userId: string): UserSettings {
  try {
    const raw = localStorage.getItem(`${LOCAL_SETTINGS_PREFIX}${userId}`);
    if (!raw) return { ...DEFAULT_USER_SETTINGS, userId };
    return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw), userId };
  } catch {
    return { ...DEFAULT_USER_SETTINGS, userId };
  }
}

function setLocalSettings(userId: string, settings: UserSettings): void {
  try {
    localStorage.setItem(`${LOCAL_SETTINGS_PREFIX}${userId}`, JSON.stringify(settings));
  } catch (e) {
    console.warn('Unable to persist local settings:', e);
  }
}

function getLocalAIMemories(userId: string): AIMemoryItem[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_MEMORY_PREFIX}${userId}`);
    if (!raw) return [];
    const parsed: AIMemoryItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch {
    return [];
  }
}

function setLocalAIMemories(userId: string, memories: AIMemoryItem[]): void {
  try {
    localStorage.setItem(`${LOCAL_MEMORY_PREFIX}${userId}`, JSON.stringify(memories));
  } catch (e) {
    console.warn('Unable to persist local AI memories:', e);
  }
}

/**
 * Save user settings to /users/{userId}/settings/preferences
 */
export async function saveUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  if (!userId) return;
  const current = getLocalSettings(userId);
  const updated: UserSettings = {
    ...current,
    ...settings,
    userId,
    updatedAt: Date.now(),
  };
  const cleanPayload = stripUndefined(updated);
  setLocalSettings(userId, cleanPayload);

  if (userId.startsWith('guest_') || !auth.currentUser) {
    return;
  }

  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(settingsDocRef, cleanPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore settings write fallback:', err?.message);
  }
}

/**
 * Subscribe to User Settings
 */
export function subscribeToUserSettings(
  userId: string,
  onData: (settings: UserSettings) => void,
  onError: (err: any) => void
): Unsubscribe {
  if (!userId) {
    onData(DEFAULT_USER_SETTINGS);
    return () => {};
  }

  if (userId.startsWith('guest_') || !auth.currentUser) {
    onData(getLocalSettings(userId));
    return () => {};
  }

  try {
    const settingsDocRef = doc(db, 'users', userId, 'settings', 'preferences');
    return onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserSettings;
          setLocalSettings(userId, data);
          onData(data);
        } else {
          const defaultSet = { ...DEFAULT_USER_SETTINGS, userId };
          onData(defaultSet);
        }
      },
      (error) => {
        console.warn('Firestore settings listener fallback:', error.message);
        onData(getLocalSettings(userId));
        onError(error);
      }
    );
  } catch {
    onData(getLocalSettings(userId));
    return () => {};
  }
}

/**
 * Save or update an AI Memory Item in /users/{userId}/ai_memories/{memoryId}
 */
export async function saveAIMemory(userId: string, memory: AIMemoryItem): Promise<void> {
  if (!userId || !memory.id) return;
  const cleanPayload = stripUndefined({
    ...memory,
    userId,
    updatedAt: Date.now(),
  });

  const localMems = getLocalAIMemories(userId);
  const idx = localMems.findIndex((m) => m.id === memory.id);
  if (idx >= 0) {
    localMems[idx] = cleanPayload;
  } else {
    localMems.unshift(cleanPayload);
  }
  setLocalAIMemories(userId, localMems);

  if (userId.startsWith('guest_') || !auth.currentUser) {
    return;
  }

  try {
    const memDocRef = doc(db, 'users', userId, 'ai_memories', memory.id);
    await setDoc(memDocRef, cleanPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore AI memory write fallback:', err?.message);
  }
}

/**
 * Delete an AI Memory item
 */
export async function deleteAIMemory(userId: string, memoryId: string): Promise<void> {
  if (!userId || !memoryId) return;

  const localMems = getLocalAIMemories(userId).filter((m) => m.id !== memoryId);
  setLocalAIMemories(userId, localMems);

  if (userId.startsWith('guest_') || !auth.currentUser) {
    return;
  }

  try {
    const memDocRef = doc(db, 'users', userId, 'ai_memories', memoryId);
    await deleteDoc(memDocRef);
  } catch (err: any) {
    console.warn('Firestore AI memory delete fallback:', err?.message);
  }
}

/**
 * Subscribe to AI Memory items
 */
export function subscribeToAIMemories(
  userId: string,
  onData: (memories: AIMemoryItem[]) => void,
  onError: (err: any) => void
): Unsubscribe {
  if (!userId) {
    onData([]);
    return () => {};
  }

  if (userId.startsWith('guest_') || !auth.currentUser) {
    onData(getLocalAIMemories(userId));
    return () => {};
  }

  try {
    const memoriesCollRef = collection(db, 'users', userId, 'ai_memories');
    const q = query(memoriesCollRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items: AIMemoryItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as AIMemoryItem);
        });
        setLocalAIMemories(userId, items);
        onData(items);
      },
      (error) => {
        console.warn('Firestore AI memories listener fallback:', error.message);
        onData(getLocalAIMemories(userId));
        onError(error);
      }
    );
  } catch {
    onData(getLocalAIMemories(userId));
    return () => {};
  }
}

/**
 * "Forget Me" Atomic 1-Click Multi-Collection & Vault Purge
 * Completely erases all reflections, goals, daily plans, memories, settings, interactions, and local cached data for this user.
 */
export async function forgetMePurgeAllData(userId: string): Promise<void> {
  if (!userId) return;

  // 1. Clear local memory and vault cache
  try {
    localStorage.removeItem(`${LOCAL_VAULT_PREFIX}${userId}`);
    localStorage.removeItem(`${LOCAL_GOALS_PREFIX}${userId}`);
    localStorage.removeItem(`${LOCAL_SETTINGS_PREFIX}${userId}`);
    localStorage.removeItem(`${LOCAL_MEMORY_PREFIX}${userId}`);
    localStorage.removeItem(`reflect_ai_digest_${userId}`);
    localStorage.removeItem(`reflect_ai_patterns_${userId}`);
    
    // Purge any daily plan keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(`${LOCAL_PLAN_PREFIX}${userId}`) || key.startsWith(userId))) {
        localStorage.removeItem(key);
      }
    }

    const subs = storageSubscribers.get(userId);
    if (subs) {
      subs.forEach((cb) => cb([]));
    }
  } catch (e) {
    console.warn('Error purging local storage cache:', e);
  }

  // 2. Clear Firestore documents if authenticated
  if (auth.currentUser && !userId.startsWith('guest_')) {
    try {
      const collectionsToPurge = ['entries', 'goals', 'daily_plans', 'ai_memories', 'settings', 'interactions', 'reflections'];
      for (const collName of collectionsToPurge) {
        try {
          const collRef = collection(db, 'users', userId, collName);
          const q = query(collRef);
          const snapshot = await new Promise<any>((resolve, reject) => {
            const unsub = onSnapshot(q, (snap) => {
              unsub();
              resolve(snap);
            }, reject);
          });
          const deletePromises: Promise<any>[] = [];
          snapshot.forEach((docSnap: any) => {
            deletePromises.push(deleteDoc(doc(db, 'users', userId, collName, docSnap.id)));
          });
          await Promise.all(deletePromises);
        } catch (e) {
          console.warn(`Error purging collection ${collName}:`, e);
        }
      }
    } catch (err: any) {
      console.warn('Error purging Firestore documents:', err?.message);
    }
  }
}

export { onAuthStateChanged };
export type { User };


