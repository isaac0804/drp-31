import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage, ChatMeta } from './types';

const CHATS_COL = 'chats';

function messagesCol(sessionId: string) {
  return collection(db, CHATS_COL, sessionId, 'messages');
}

function chatMetaRef(sessionId: string) {
  return doc(db, CHATS_COL, sessionId);
}

export async function sendMessage(
  sessionId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  await addDoc(messagesCol(sessionId), {
    senderId,
    senderName,
    senderAvatar,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  await setDoc(
    chatMetaRef(sessionId),
    {
      lastMessageAt: serverTimestamp(),
      lastMessageText: trimmed,
      lastMessageSenderId: senderId,
      lastMessageSenderName: senderName,
      readBy: { [senderId]: serverTimestamp() },
    },
    { merge: true }
  );
}

export function subscribeToMessages(
  sessionId: string,
  onChange: (messages: ChatMessage[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(messagesCol(sessionId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) =>
      onChange(
        snapshot.docs.map((d) => {
          const data = d.data();
          const createdAt =
            data.createdAt instanceof Timestamp
              ? data.createdAt.toMillis()
              : Date.now();
          return { id: d.id, ...data, createdAt } as ChatMessage;
        })
      ),
    onError
  );
}

/** Marks a chat as read by a user, clearing its unread/notification state. */
export async function markChatRead(sessionId: string, userId: string): Promise<void> {
  await setDoc(
    chatMetaRef(sessionId),
    { readBy: { [userId]: serverTimestamp() } },
    { merge: true }
  );
}

/**
 * Subscribes to last-message/unread metadata for a set of chats at once, used to
 * order the chats list by recency and to drive unread notifications.
 */
export function subscribeToChatMetas(
  sessionIds: string[],
  onChange: (metas: Record<string, ChatMeta>) => void,
  onError: (error: Error) => void
): () => void {
  const metas: Record<string, ChatMeta> = {};
  const unsubs = sessionIds.map((sessionId) =>
    onSnapshot(
      chatMetaRef(sessionId),
      (snap) => {
        if (!snap.exists()) {
          delete metas[sessionId];
        } else {
          const data = snap.data();
          const readBy: Record<string, number> = {};
          for (const [uid, ts] of Object.entries((data.readBy ?? {}) as Record<string, unknown>)) {
            readBy[uid] = ts instanceof Timestamp ? ts.toMillis() : 0;
          }
          metas[sessionId] = {
            lastMessageAt: data.lastMessageAt instanceof Timestamp ? data.lastMessageAt.toMillis() : 0,
            lastMessageText: data.lastMessageText ?? '',
            lastMessageSenderId: data.lastMessageSenderId ?? '',
            lastMessageSenderName: data.lastMessageSenderName ?? '',
            readBy,
          };
        }
        onChange({ ...metas });
      },
      onError
    )
  );
  return () => unsubs.forEach((unsub) => unsub());
}
