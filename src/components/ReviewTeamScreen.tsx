import { MatchSession, Player } from '../types';
import { ArrowLeft, MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewTeamScreenProps {
  session: MatchSession;
  currentUserId: string;
  onSelectPlayer: (player: Player) => void;
  onBack: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ReviewTeamScreen({
  session,
  currentUserId,
  onSelectPlayer,
  onBack,
}: ReviewTeamScreenProps) {
  const teammates = session.playersJoined.filter((p) => p.id !== currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-black text-xl text-white tracking-tight">Review Team</h2>
          <p className="text-xs text-on-surface-variant/50 mt-0.5">Select a player to review</p>
        </div>
      </div>

      {/* Session context pill */}
      <div className="flex items-center gap-2.5 bg-surface-container rounded-xl px-3.5 py-2.5 border border-outline-variant/15">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-xs font-bold text-white truncate">
            {session.matchType === 'singles' ? 'Badminton Singles' : 'Badminton Doubles'}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5 text-on-surface-variant/40 shrink-0" />
            <span className="text-[11px] text-on-surface-variant/50 truncate">{session.venue}</span>
          </div>
        </div>
        <span className="text-[11px] text-on-surface-variant/40 font-medium shrink-0">
          {formatDate(session.date)}
        </span>
      </div>

      {/* Player list */}
      <div className="flex flex-col gap-2">
        {teammates.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant/40 text-sm">
            No other players in this session.
          </div>
        ) : (
          teammates.map((player, i) => (
            <motion.button
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.05 }}
              onClick={() => onSelectPlayer(player)}
              className="w-full flex items-center gap-3.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/15 rounded-2xl px-4 py-3.5 transition-all cursor-pointer group text-left"
            >
              <img
                src={player.avatar}
                alt={player.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-outline-variant/20 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-white">{player.name}</p>
                <p className="text-[11px] text-on-surface-variant/50 mt-0.5">Tap to review</p>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant/30 group-hover:text-primary-fixed transition-colors shrink-0" />
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
}
