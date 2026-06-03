import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { PlayAgain, Review, SkillAccuracy } from './types';

const REVIEWS_COL = 'reviews';

export async function submitReview(
  reviewerId: string,
  revieweeId: string,
  sessionId: string,
  playAgain: PlayAgain,
  skillAccuracy: SkillAccuracy,
  feedback: string
): Promise<void> {
  const review: Omit<Review, 'id'> = {
    reviewerId,
    revieweeId,
    sessionId,
    playAgain,
    skillAccuracy,
    feedback,
    createdAt: Date.now(),
  };
  await addDoc(collection(db, REVIEWS_COL), review);
}

export async function getReviewsForPlayer(playerId: string): Promise<Review[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('revieweeId', '==', playerId)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'>) }));
  return reviews.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReviewedPlayerIds(
  reviewerId: string,
  sessionId: string
): Promise<string[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('reviewerId', '==', reviewerId),
    where('sessionId', '==', sessionId)
  );
  const snap = await getDocs(q);
  return Array.from(
    new Set(snap.docs.map((d) => (d.data() as Pick<Review, 'revieweeId'>).revieweeId))
  );
}
