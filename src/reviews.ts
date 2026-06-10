import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { PlayAgain, Review, SkillAccuracy, Reliability, Sportsmanship, Vibe, HostReview, SessionOrganisation, VenueAccuracy, WelcomingAtmosphere, ChatResponsiveness } from './types';

const REVIEWS_COL = 'reviews';

export async function submitReview(
  reviewerId: string,
  revieweeId: string,
  sessionId: string,
  playAgain: PlayAgain,
  skillAccuracy: SkillAccuracy,
  reliability: Reliability,
  sportsmanship: Sportsmanship,
  vibe: Vibe,
  feedback: string,
  isAnonymous: boolean,
  reviewerName?: string,
  reviewerAvatar?: string,
): Promise<void> {
  const review: Omit<Review, 'id'> = {
    reviewerId,
    revieweeId,
    sessionId,
    playAgain,
    skillAccuracy,
    reliability,
    sportsmanship,
    vibe,
    feedback,
    createdAt: Date.now(),
    isAnonymous,
    ...(!isAnonymous && reviewerName  ? { reviewerName }  : {}),
    ...(!isAnonymous && reviewerAvatar ? { reviewerAvatar } : {}),
  };
  await addDoc(collection(db, REVIEWS_COL), review);
}

export async function getReviewsForPlayer(playerId: string): Promise<Review[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('revieweeId', '==', playerId)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Review, 'id'> & { isHostReview?: boolean }) }))
    .filter((r) => !r.isHostReview);
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

export async function submitHostReview(
  reviewerId: string,
  revieweeId: string,
  sessionId: string,
  starRating: number,
  sessionOrganisation: SessionOrganisation,
  venueAccuracy: VenueAccuracy,
  welcomingAtmosphere: WelcomingAtmosphere,
  chatResponsiveness: ChatResponsiveness,
  feedback?: string,
): Promise<void> {
  const review = {
    reviewerId,
    revieweeId,
    sessionId,
    starRating,
    sessionOrganisation,
    venueAccuracy,
    welcomingAtmosphere,
    chatResponsiveness,
    feedback: feedback ?? '',
    createdAt: Date.now(),
    isHostReview: true,
  };
  await addDoc(collection(db, REVIEWS_COL), review);
}

export async function getHostReviewsForPlayer(playerId: string): Promise<HostReview[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('revieweeId', '==', playerId),
    where('isHostReview', '==', true)
  );
  const snap = await getDocs(q);
  const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HostReview, 'id'>) }));
  return reviews.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getReviewedHostSessionIds(reviewerId: string): Promise<string[]> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('reviewerId', '==', reviewerId),
    where('isHostReview', '==', true)
  );
  const snap = await getDocs(q);
  return Array.from(
    new Set(snap.docs.map((d) => (d.data() as Pick<HostReview, 'sessionId'>).sessionId))
  );
}
