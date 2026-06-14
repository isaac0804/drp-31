import { useState, useEffect, useMemo } from 'react';
import { MatchSession, Player } from '../types';
import { getAllReviewsByUser } from '../reviews';
import { MapPin, Star, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReviewTeamScreen from './ReviewTeamScreen';
import ReviewPlayerScreen from './ReviewPlayerScreen';
import ReviewHostScreen from './ReviewHostScreen';

interface ReviewsScreenProps {
  sessions: MatchSession[];
  currentUserId: string;
  reviewerName: string;
  reviewerAvatar: string;
  onReviewSubmitted?: (sessionId: string, revieweeId: string, isHostReview: boolean) => void;
}

function isFinished(s: MatchSession): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (s.date > todayStr) return false;
  if (s.date === todayStr) {
    const [endH, endM] = s.timeEnd.split(':').map(Number);
    return endH < now.getHours() || (endH === now.getHours() && endM <= now.getMinutes());
  }
  return true;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ReviewsScreen({ sessions, currentUserId, reviewerName, reviewerAvatar, onReviewSubmitted }: ReviewsScreenProps) {
  const [reviewingSession, setReviewingSession] = useState<MatchSession | null>(null);
  const [reviewingPlayer, setReviewingPlayer]   = useState<Player | null>(null);
  const [reviewingHost, setReviewingHost]       = useState(false);
  const [allUserReviews, setAllUserReviews]     = useState<{ sessionId: string; revieweeId: string; isHostReview: boolean }[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllReviewsByUser(currentUserId)
      .then((reviews) => { if (!cancelled) setAllUserReviews(reviews); })
      .catch(() => { if (!cancelled) setAllUserReviews([]); });
    return () => { cancelled = true; };
  }, [currentUserId]);

  const reviewedPlayerIdsBySession = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allUserReviews.filter(r => !r.isHostReview).forEach(r => {
      if (!map.has(r.sessionId)) map.set(r.sessionId, new Set());
      map.get(r.sessionId)!.add(r.revieweeId);
    });
    return map;
  }, [allUserReviews]);

  const reviewedHostSessionIds = useMemo(() =>
    new Set(allUserReviews.filter(r => r.isHostReview).map(r => r.sessionId)),
    [allUserReviews]
  );

  const reviewedPlayerIds = useMemo(() =>
    reviewingSession ? Array.from(reviewedPlayerIdsBySession.get(reviewingSession.id) ?? []) : [],
    [reviewingSession, reviewedPlayerIdsBySession]
  );

  const finishedSessions = useMemo(() =>
    sessions.filter(s => {
      if (s.host.id !== currentUserId && !s.playersJoined.some(p => p.id === currentUserId)) return false;
      if (!isFinished(s)) return false;
      const reviewablePlayers = s.playersJoined.filter(p => p.id !== currentUserId);
      const sessionReviewedIds = reviewedPlayerIdsBySession.get(s.id) ?? new Set<string>();
      const allPlayersReviewed = reviewablePlayers.every(p => sessionReviewedIds.has(p.id));
      const isCurrentUserHost = s.host.id === currentUserId;
      const hostReviewed = isCurrentUserHost || reviewedHostSessionIds.has(s.id);
      return !(allPlayersReviewed && hostReviewed);
    }),
    [sessions, currentUserId, reviewedPlayerIdsBySession, reviewedHostSessionIds]
  );

  if (reviewingPlayer && reviewingSession) {
    return (
      <ReviewPlayerScreen
        reviewerId={currentUserId}
        reviewerName={reviewerName}
        reviewerAvatar={reviewerAvatar}
        player={reviewingPlayer}
        session={reviewingSession}
        onBack={() => setReviewingPlayer(null)}
        onSubmit={() => {
          setAllUserReviews(prev => [...prev, { sessionId: reviewingSession.id, revieweeId: reviewingPlayer.id, isHostReview: false }]);
          onReviewSubmitted?.(reviewingSession.id, reviewingPlayer.id, false);
          setReviewingPlayer(null);
        }}
      />
    );
  }

  if (reviewingHost && reviewingSession) {
    return (
      <ReviewHostScreen
        reviewerId={currentUserId}
        host={reviewingSession.host}
        session={reviewingSession}
        onBack={() => setReviewingHost(false)}
        onSubmit={() => {
          setAllUserReviews(prev => [...prev, { sessionId: reviewingSession.id, revieweeId: reviewingSession.host.id, isHostReview: true }]);
          onReviewSubmitted?.(reviewingSession.id, reviewingSession.host.id, true);
          setReviewingHost(false);
        }}
      />
    );
  }

  if (reviewingSession) {
    return (
      <ReviewTeamScreen
        session={reviewingSession}
        currentUserId={currentUserId}
        reviewedPlayerIds={reviewedPlayerIds}
        onSelectPlayer={setReviewingPlayer}
        onBack={() => setReviewingSession(null)}
        onReviewHost={() => setReviewingHost(true)}
        hasReviewedHost={reviewedHostSessionIds.has(reviewingSession.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h2 className="font-sans font-black text-2xl text-white tracking-tight">Reviews</h2>
        <p className="text-sm text-on-surface-variant/60">Rate players from your completed sessions.</p>
      </section>

      <AnimatePresence mode="wait">
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          {finishedSessions.length === 0 ? (
            <div className="border border-outline-variant/15 rounded-2xl p-10 text-center flex flex-col items-center gap-3 bg-surface-container/40">
              <div className="w-11 h-11 rounded-full bg-outline-variant/10 flex items-center justify-center text-on-surface-variant/40">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-on-surface">No sessions to review</h3>
                <p className="text-xs text-on-surface-variant/50 mt-1 max-w-[240px] mx-auto leading-relaxed">
                  Once you've played in a session, you can rate your teammates here.
                </p>
              </div>
            </div>
          ) : (
            finishedSessions.map((session, i) => {
              const reviewablePlayers = session.playersJoined.filter((p) => p.id !== currentUserId);
              const sessionReviewedIds = reviewedPlayerIdsBySession.get(session.id) ?? new Set<string>();
              const pendingPlayers = reviewablePlayers.filter(p => !sessionReviewedIds.has(p.id));

              return (
                <motion.article
                  key={session.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.05 }}
                  className="bg-surface-container rounded-2xl border border-outline-variant/15 overflow-hidden"
                >
                  <div className="p-4 flex flex-col gap-3">
                    {/* Title */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-white leading-snug">
                          {session.sport === 'Football' && session.footballFormat
                            ? `${session.sport} ${session.footballFormat}`
                            : `${session.sport} ${session.matchType === 'singles' ? 'Singles' : 'Doubles'}`}
                        </h3>
                        <p className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant/55">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{session.venue}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/25 shrink-0">
                        COMPLETED
                      </span>
                    </div>

                    {/* Date / Time */}
                    <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-outline-variant/10">
                      <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-black/20">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant/40">Date</span>
                        <span className="text-xs font-semibold text-on-surface">{formatDate(session.date)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-black/20 border-l border-outline-variant/10">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant/40">Time</span>
                        <span className="text-xs font-semibold text-on-surface">{session.timeStart} – {session.timeEnd}</span>
                      </div>
                    </div>

                    {/* Player avatars */}
                    {pendingPlayers.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {pendingPlayers.slice(0, 5).map((p) => (
                            <img
                              key={p.id}
                              src={p.avatar}
                              alt={p.name}
                              className="w-7 h-7 rounded-full border-2 border-surface-container object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-on-surface-variant/50">
                          {pendingPlayers.length} player{pendingPlayers.length > 1 ? 's' : ''} to rate
                        </span>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => setReviewingSession(session)}
                      className="w-full py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-primary-fixed/40 bg-primary-fixed/8 hover:bg-primary-fixed/15 text-primary-fixed"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Review Players
                    </button>
                  </div>
                </motion.article>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
