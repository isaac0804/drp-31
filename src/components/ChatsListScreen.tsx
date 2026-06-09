import { MessageCircle, ChevronRight } from 'lucide-react';
import { MatchSession, UserProfile } from '../types';

interface ChatsListScreenProps {
  sessions: MatchSession[];
  currentUser: UserProfile;
  onOpenChat: (sessionId: string) => void;
}

function sessionLabel(s: MatchSession): string {
  if (s.sport === 'Football' && s.footballFormat) return `${s.sport} ${s.footballFormat}`;
  return `${s.sport} ${s.matchType === 'singles' ? 'Singles' : 'Doubles'}`;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  } catch {}
  return dateStr;
}

export default function ChatsListScreen({ sessions, currentUser, onOpenChat }: ChatsListScreenProps) {
  const myChats = sessions.filter(
    (s) =>
      s.host.id === currentUser.id ||
      s.playersJoined.some((p) => p.id === currentUser.id)
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="pb-10">
      <div className="pt-4 pb-6">
        <h1 className="font-sans font-black text-2xl uppercase tracking-tight text-white">
          Your Chats
        </h1>
        <p className="text-xs font-mono text-on-surface-variant mt-1">
          Group chats for sessions you're in
        </p>
      </div>

      {myChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24 opacity-50">
          <MessageCircle className="w-10 h-10 text-on-surface-variant" />
          <p className="font-sans font-bold text-sm uppercase tracking-wider text-on-surface-variant">
            No chats yet
          </p>
          <p className="text-xs text-on-surface-variant text-center">
            Join a session to access its group chat.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {myChats.map((session) => {
            const isHost = session.host.id === currentUser.id;
            const avatars = session.playersJoined.slice(0, 4);

            return (
              <button
                key={session.id}
                onClick={() => onOpenChat(session.id)}
                className="w-full flex items-center gap-4 p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl border border-outline-variant/15 transition-all active:scale-[0.99] cursor-pointer text-left"
              >
                {/* Stacked avatars */}
                <div className="relative h-12 shrink-0" style={{ width: Math.min(avatars.length, 3) * 20 + 28 }}>
                  {avatars.slice(0, 3).map((p, i) => (
                    <img
                      key={p.id}
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="absolute w-10 h-10 rounded-full object-cover border-2 border-surface-container-high"
                      style={{ left: i * 20 }}
                    />
                  ))}
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-sans font-extrabold text-sm text-on-surface truncate">
                      {sessionLabel(session)}
                    </span>
                    {isHost && (
                      <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-primary-fixed/20 text-primary-fixed px-1.5 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-on-surface-variant truncate mt-0.5">
                    {session.venue}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 text-[11px] font-sans font-bold px-2 py-0.5 rounded-md tracking-wide">
                      {formatDate(session.date)}
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant/60">
                      {session.playersJoined.length}/{session.maxPlayers} players
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
