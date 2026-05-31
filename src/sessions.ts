import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { INITIAL_SESSIONS } from './data';
import { db } from './firebase';
import { MatchSession, Player } from './types';

const SESSIONS_COL = 'sessions';

function sessionRef(id: string) {
  return doc(db, SESSIONS_COL, id);
}

async function seedIfEmpty(): Promise<void> {
  const snap = await getDocs(collection(db, SESSIONS_COL));
  if (!snap.empty) return;
  const batch = writeBatch(db);
  for (const session of INITIAL_SESSIONS) {
    batch.set(doc(db, SESSIONS_COL, session.id), session);
  }
  await batch.commit();
}

export function subscribeToSessions(
  onChange: (sessions: MatchSession[]) => void,
  onError: (error: Error) => void
): () => void {
  seedIfEmpty().catch(onError);
  const q = query(collection(db, SESSIONS_COL), orderBy('date', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => d.data() as MatchSession)),
    onError
  );
}

export async function postSession(session: MatchSession): Promise<void> {
  await setDoc(sessionRef(session.id), session);
}

export async function updateSession(id: string, fields: Partial<MatchSession>): Promise<void> {
  await updateDoc(sessionRef(id), fields as Record<string, unknown>);
}

export async function cancelSession(id: string): Promise<void> {
  await deleteDoc(sessionRef(id));
}

export async function joinSession(sessionId: string, player: Player): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = sessionRef(sessionId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const session = snap.data() as MatchSession;
    if (session.playersJoined.length >= session.maxPlayers) return;
    if (session.playersJoined.some((p) => p.id === player.id)) return;
    tx.update(ref, { playersJoined: [...session.playersJoined, player] });
  });
}

export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  await runTransaction(db, async (tx) => {
    const ref = sessionRef(sessionId);
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const session = snap.data() as MatchSession;
    if (session.host.id === userId) return;
    tx.update(ref, { playersJoined: session.playersJoined.filter((p) => p.id !== userId) });
  });
}

export async function updateSessionsForPlayer(
  sessions: MatchSession[],
  userId: string,
  playerUpdates: Pick<Player, 'name' | 'avatar'>
): Promise<void> {
  const affected = sessions.filter(
    (s) => s.host.id === userId || s.playersJoined.some((p) => p.id === userId)
  );
  if (affected.length === 0) return;

  const batch = writeBatch(db);
  for (const s of affected) {
    const fields: Partial<MatchSession> = {
      playersJoined: s.playersJoined.map((p) =>
        p.id === userId ? { ...p, ...playerUpdates } : p
      ),
    };
    if (s.host.id === userId) {
      fields.host = { ...s.host, ...playerUpdates };
    }
    batch.update(sessionRef(s.id), fields as Record<string, unknown>);
  }
  await batch.commit();
}
