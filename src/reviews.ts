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
  return snap.docs.map((d) => (d.data() as Review).revieweeId);
}
