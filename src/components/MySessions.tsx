import { useState, useEffect, type ReactNode } from 'react';
import { MatchSession, Player } from '../types';
import { getReviewedPlayerIds } from '../reviews';
import { MapPin, Edit3, Trash2, Plus, Trophy, Users, LogOut, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReviewTeamScreen from './ReviewTeamScreen';
import ReviewPlayerScreen from './ReviewPlayerScreen';

interface MySessionsProps {
  sessions: MatchSession[];
  currentUserId: string;
  onEditSession: (session: MatchSession) => void;
  onCancelSession: (id: string) => void;
  onLeaveSession: (id: string) => void;
  onNavigateToHost: () => void;
}

type Tab = 'hosting' | 'joined' | 'finished';

function isUpcoming(dateStr: string): boolean {
  return dateStr >= new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const TAB_CONFIG = {
  hosting:  { active: 'border-primary-fixed text-primary-fixed' },
  joined:   { active: 'border-primary-fixed text-primary-fixed' },
  finished: { active: 'border-primary-fixed text-primary-fixed' },
};

export default function MySessions({
  sessions,
  currentUserId,
  onEditSession,
  onCancelSession,
  onLeaveSession,
  onNavigateToHost,
}: MySessionsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('hosting');
  const [reviewingSession, setReviewingSession] = useState<MatchSession | null>(null);
  const [reviewingPlayer, setReviewingPlayer] = useState<Player | null>(null);
  const [reviewedPlayerIds, setReviewedPlayerIds] = useState<string[]>([]);

  useEffect(() => {
    if (!reviewingSession) { setReviewedPlayerIds([]); return; }
    getReviewedPlayerIds(currentUserId, reviewingSession.id)
      .then(setReviewedPlayerIds)
      .catch(() => setReviewedPlayerIds([]));
  }, [reviewingSession, currentUserId]);

  const hostingSessions = sessions.filter(
    (s) => s.host.id === currentUserId && isUpcoming(s.date)
  );
  const joinedSessions = sessions.filter(
    (s) =>
      s.host.id !== currentUserId &&
      s.playersJoined.some((p) => p.id === currentUserId) &&
      isUpcoming(s.date)
  );
  const finishedSessions = sessions.filter(
    (s) =>
      (s.host.id === currentUserId || s.playersJoined.some((p) => p.id === currentUserId)) &&
      !isUpcoming(s.date)
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'hosting',  label: 'Hosting',  count: hostingSessions.length },
    { key: 'joined',   label: 'Joined',   count: joinedSessions.length },
    { key: 'finished', label: 'Finished', count: finishedSessions.length },
  ];

  if (reviewingPlayer && reviewingSession) {
    return (
      <ReviewPlayerScreen
        reviewerId={currentUserId}
        player={reviewingPlayer}
        session={reviewingSession}
        onBack={() => setReviewingPlayer(null)}
        onSubmit={() => {
          setReviewedPlayerIds((prev) => [...prev, reviewingPlayer.id]);
          setReviewingPlayer(null);
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
        onBack={() => { setReviewingSession(null); setReviewedPlayerIds([]); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-1">
        <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
          My Sessions
        </h2>
        <p className="text-sm text-on-surface-variant/60">Your upcoming and past matches.</p>
      </section>

      {/* Tab Bar */}
      <div className="flex border-b border-outline-variant/20">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 pb-3 pt-1 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${
              activeTab === tab.key
                ? TAB_CONFIG[tab.key].active
                : 'border-transparent text-on-surface-variant/35 hover:text-on-surface-variant/60'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[9px] font-extrabold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${
                activeTab === tab.key ? 'bg-current/20' : 'bg-outline-variant/15 text-on-surface-variant/40'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
          className="flex flex-col gap-3"
        >
          {/* HOSTING */}
          {activeTab === 'hosting' && (
            <>
              {hostingSessions.length === 0 ? (
                <EmptyState
                  icon={<Trophy className="w-5 h-5" />}
                  title="No Hosted Sessions"
                  description="You haven't posted any upcoming games. Set up a court and find partners to join!"
                  action={{ label: 'Host a New Session', onClick: onNavigateToHost }}
                />
              ) : (
                hostingSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    
                    badge="HOST"
                    badgeStyle="bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/25"
                    actions={
                      <div className="flex gap-2.5 pt-1">
                        <button
                          onClick={() => onEditSession(session)}
                          className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => onCancelSession(session.id)}
                          className="flex-1 py-2.5 rounded-xl border border-error/30 hover:bg-error/8 text-error text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    }
                  />
                ))
              )}
              <NewSessionCard onClick={onNavigateToHost} />
            </>
          )}

          {/* JOINED */}
          {activeTab === 'joined' && (
            <>
              {joinedSessions.length === 0 ? (
                <EmptyState
                  icon={<Users className="w-5 h-5" />}
                  title="No Joined Sessions"
                  description="You haven't joined any upcoming matches. Browse the Explore tab to find a game!"
                />
              ) : (
                joinedSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    
                    badge="JOINED"
                    badgeStyle="bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/25"
                    actions={
                      <div className="pt-1">
                        <button
                          onClick={() => onLeaveSession(session.id)}
                          className="w-full py-2.5 rounded-xl border border-error/30 hover:bg-error/8 text-error text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Leave Match
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </>
          )}

          {/* FINISHED */}
          {activeTab === 'finished' && (
            <>
              {finishedSessions.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle className="w-5 h-5" />}
                  title="No Finished Sessions"
                  description="Your completed matches will show up here."
                />
              ) : (
                finishedSessions.map((session, i) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    index={i}
                    
                    badge="COMPLETED"
                    badgeStyle="bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/25"
                    actions={
                      <div className="flex gap-2.5 pt-1">
                        <button
                          onClick={() => setReviewingSession(session)}
                          className="flex-1 py-2.5 rounded-xl border border-outline-variant/25 bg-surface-container-high/40 hover:bg-surface-container-high text-on-surface text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                          <Users className="w-3.5 h-3.5" />
                          Review Team
                        </button>
                      </div>
                    }
                  />
                ))
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SessionCard({
  session,
  index,
  badge,
  badgeStyle,
  actions,
}: {
  key?: string;
  session: MatchSession;
  index: number;
  badge: string;
  badgeStyle: string;
  actions: ReactNode;
}) {
  const spacesJoined = session.playersJoined.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      className="relative bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/15"
    >
      <div className="p-4 flex flex-col gap-3">
        {/* Title + badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-white leading-snug">
              {session.matchType === 'singles' ? 'Badminton Singles' : 'Badminton Doubles'}
            </h3>
            <p className="flex items-center gap-1 mt-1 text-[11px] text-on-surface-variant/55">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{session.venue}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-md ${badgeStyle}`}>
              {badge}
            </span>
            <span className="text-[11px] text-on-surface-variant/50 font-medium">
              {spacesJoined}/{session.maxPlayers} Players
            </span>
          </div>
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

        {actions}
      </div>
    </motion.article>
  );
}

function NewSessionCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      onClick={onClick}
      className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-7 flex flex-col items-center justify-center gap-2.5 text-center hover:border-primary-fixed/35 hover:bg-primary-fixed/3 transition-all cursor-pointer group"
    >
      <div className="w-10 h-10 rounded-full bg-primary-fixed/8 group-hover:bg-primary-fixed/15 flex items-center justify-center text-primary-fixed transition-colors">
        <Plus className="w-5 h-5 stroke-[2.5px]" />
      </div>
      <div>
        <p className="font-bold text-sm text-on-surface uppercase tracking-wide">Host a New Session</p>
        <p className="text-[11px] text-on-surface-variant/50 mt-0.5">Set up a match and invite players to join.</p>
      </div>
    </motion.article>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="border border-outline-variant/15 rounded-2xl p-10 text-center flex flex-col items-center gap-3 bg-surface-container/40">
      <div className="w-11 h-11 rounded-full bg-outline-variant/10 flex items-center justify-center text-on-surface-variant/40">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm text-on-surface">{title}</h3>
        <p className="text-xs text-on-surface-variant/50 mt-1 max-w-[240px] mx-auto leading-relaxed">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed text-[11px] font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer uppercase tracking-wider"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
