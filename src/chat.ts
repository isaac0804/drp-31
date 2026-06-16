import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { ChatMessage } from './types';

function messagesCol(sessionId: string) {
  return collection(db, 'chats', sessionId, 'messages');
}

export async function sendMessage(
  sessionId: string,
  senderId: string,
  senderName: string,
  senderAvatar: string,
  text: string
): Promise<void> {
  await addDoc(messagesCol(sessionId), {
    senderId,
    senderName,
    senderAvatar,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
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
