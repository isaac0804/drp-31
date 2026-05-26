import { MatchSession } from '../types';
import { MapPin, Calendar, Clock, Edit3, Trash2, Plus, RefreshCw, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface MySessionsProps {
  sessions: MatchSession[];
  currentUserId: string;
  onEditSession: (session: MatchSession) => void;
  onCancelSession: (id: string) => void;
  onNavigateToHost: () => void;
}

export default function MySessions({
  sessions,
  currentUserId,
  onEditSession,
  onCancelSession,
  onNavigateToHost
}: MySessionsProps) {
  // Filter for sessions owned / hosted by current user
  const myHostedSessions = sessions.filter((s) => s.host.id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <section className="space-y-1">
        <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
          My Sessions
        </h2>
        <p className="text-sm text-on-surface-variant/80">Manage your hosted matches.</p>
      </section>

      {/* Managed Sessions List */}
      <section className="flex flex-col gap-5">
        {myHostedSessions.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-variant/30 flex items-center justify-center text-on-surface-variant/70">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="font-sans font-bold text-base text-on-surface">No Hosted Matches Yet</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-xs mx-auto">
              You haven't posted any badminton games. Set up a custom court, dictate skill ratings, and find partners to join!
            </p>
            <button
              onClick={onNavigateToHost}
              className="mt-2 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider"
            >
              Host A New Session
            </button>
          </div>
        ) : (
          myHostedSessions.map((session, index) => {
            const spacesJoined = session.playersJoined.length;
            const percentage = Math.min((spacesJoined / session.maxPlayers) * 100, 100);

            return (
              <motion.article
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                key={session.id}
                className="bg-[#2A2D35] rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden border border-outline-variant/30 shadow-lg"
              >
                {/* Horizontal Neon Top Bar Gauge mimicking the design screenshot exactly */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-fixed/20">
                  <div
                    className="h-full bg-primary-fixed transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Title and Badge Line */}
                <div className="flex justify-between items-start mt-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-sans font-bold text-lg text-on-surface leading-tight">
                      Badminton {session.matchType === 'singles' ? 'Singles' : 'Doubles'}
                    </h3>
                    <p className="text-xs text-on-surface-variant/90 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-primary-fixed" />
                      {session.venue}
                    </p>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-sans font-extrabold text-[10px] tracking-widest text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 rounded uppercase font-mono">
                      {session.skillLevel}
                    </span>
                    <span className="text-[11px] text-on-surface/90 font-sans font-semibold mt-1">
                      {spacesJoined}/{session.maxPlayers} Players
                    </span>
                  </div>
                </div>

                {/* Sub Card Grid holding specific Date & Time details */}
                <div className="grid grid-cols-2 gap-3 bg-surface-container-highest/40 rounded-lg p-3 border border-outline-variant/10">
                  <div className="flex flex-col">
                    <span className="font-sans font-extrabold text-[10px] uppercase text-on-surface-variant/80 tracking-wider">
                      Date
                    </span>
                    <span className="font-sans font-semibold text-xs text-on-surface mt-0.5">
                      {session.date}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-extrabold text-[10px] uppercase text-on-surface-variant/80 tracking-wider">
                      Time
                    </span>
                    <span className="font-sans font-semibold text-xs text-on-surface mt-0.5">
                      {session.timeStart} - {session.timeEnd}
                    </span>
                  </div>
                </div>

                {/* Edit and Cancel Buttons Row */}
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => onEditSession(session)}
                    className="flex-1 bg-surface-variant hover:bg-surface-bright text-on-surface font-sans font-bold text-[11px] uppercase py-3 rounded-full transition-all active:scale-98 border border-outline-variant/30 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Game
                  </button>
                  <button
                    onClick={() => onCancelSession(session.id)}
                    className="flex-1 bg-transparent hover:bg-error-container/20 text-error font-sans font-bold text-[11px] uppercase py-3 rounded-full transition-all active:scale-98 border border-error/50 flex justify-center items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </motion.article>
            );
          })
        )}

        {/* Dotted host new match card option placeholder */}
        <article
          onClick={onNavigateToHost}
          className="border-2 border-dashed border-outline-variant/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-surface-variant/20 hover:border-primary-fixed/50 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-primary-fixed/5 group-hover:bg-primary-fixed/15 flex items-center justify-center mb-1 text-primary-fixed transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5px]" />
          </div>
          <h3 className="font-sans font-bold text-sm text-on-surface uppercase tracking-wide">
            Host a New Session
          </h3>
          <p className="text-xs text-on-surface-variant/70 max-w-[220px]">
            Set up a match and invite players to join you today.
          </p>
        </article>
      </section>
    </div>
  );
}
