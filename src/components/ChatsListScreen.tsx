import { MessageCircle, ChevronRight, User } from 'lucide-react';
import { ChatMeta, MatchSession, UserProfile } from '../types';

interface ChatsListScreenProps {
  sessions: MatchSession[];
  currentUser: UserProfile;
  chatMetas: Record<string, ChatMeta>;
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

function isSessionFinished(s: MatchSession): boolean {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (s.date > todayStr) return false;
  if (s.date === todayStr) {
    const [endH, endM] = s.timeEnd.split(':').map(Number);
    return endH < now.getHours() || (endH === now.getHours() && endM <= now.getMinutes());
  }
  return true;
}

function formatLastMessageTime(ms: number): string {
  const diffMs = Date.now() - ms;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const d = new Date(ms);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatsListScreen({ sessions, currentUser, chatMetas, onOpenChat }: ChatsListScreenProps) {
  const myChats = sessions
    .filter(
      (s) =>
        s.host.id === currentUser.id ||
        s.playersJoined.some((p) => p.id === currentUser.id)
    )
    // Drop empty chats for sessions that have already happened — nothing to revisit.
    .filter((s) => {
      const meta = chatMetas[s.id];
      const hasMessages = !!meta && meta.lastMessageAt > 0;
      return hasMessages || !isSessionFinished(s);
    })
    .sort((a, b) => {
      const metaA = chatMetas[a.id];
      const metaB = chatMetas[b.id];
      const aHasMessages = !!metaA && metaA.lastMessageAt > 0;
      const bHasMessages = !!metaB && metaB.lastMessageAt > 0;
      if (aHasMessages && bHasMessages) return metaB.lastMessageAt - metaA.lastMessageAt;
      if (aHasMessages !== bHasMessages) return aHasMessages ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });

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
        <div className="space-y-4">
          {myChats.map((session) => {
            const isHost = session.host.id === currentUser.id;
            const avatars = session.playersJoined.slice(0, 4);
            const MAX_AVATARS = 4;
            const meta = chatMetas[session.id];
            const hasMessages = !!meta && meta.lastMessageAt > 0;
            const lastReadAt = meta?.readBy?.[currentUser.id] ?? 0;
            const isUnread = hasMessages && meta.lastMessageAt > lastReadAt;

            return (
              <button
                key={session.id}
                onClick={() => onOpenChat(session.id)}
                className="w-full flex items-center gap-4 p-4 bg-surface-container-high hover:bg-surface-container-highest rounded-xl border border-outline-variant/15 transition-all active:scale-[0.99] cursor-pointer text-left"
              >
                {/* Stacked avatars — fixed width so every row's text column lines up */}
                <div className="relative h-12 shrink-0" style={{ width: MAX_AVATARS * 20 + 28 }}>
                  {avatars.map((p, i) => (
                    <img
                      key={p.id}
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="absolute w-10 h-10 rounded-full object-cover border-2 border-surface-container-high"
                      style={{ left: i * 20 }}
                    />
                  ))}
                  {Array.from({ length: MAX_AVATARS - avatars.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="absolute w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface-container-high flex items-center justify-center"
                      style={{ left: (avatars.length + i) * 20 }}
                    >
                      <User className="w-4 h-4 text-on-surface-variant/40" />
                    </div>
                  ))}
                </div>

                {/* Session info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-sans text-sm text-on-surface truncate ${isUnread ? 'font-black' : 'font-extrabold'}`}>
                      {sessionLabel(session)}
                    </span>
                    {isHost && (
                      <span className="shrink-0 text-[9px] font-black uppercase tracking-wider bg-primary-fixed/20 text-primary-fixed px-1.5 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </div>

                  {hasMessages ? (
                    <div className={`text-xs truncate mt-0.5 ${isUnread ? 'text-on-surface font-bold' : 'text-on-surface-variant'}`}>
                      {meta.lastMessageSenderId === currentUser.id ? 'You: ' : `${meta.lastMessageSenderName}: `}
                      {meta.lastMessageText}
                    </div>
                  ) : (
                    <div className="text-xs text-on-surface-variant truncate mt-0.5">
                      {session.venue}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 text-[11px] font-sans font-bold px-2 py-0.5 rounded-md tracking-wide">
                      {formatDate(session.date)}
                    </span>
                    <span className="text-[10px] font-mono text-on-surface-variant/60">
                      {session.playersJoined.length}/{session.maxPlayers} players
                    </span>
                  </div>
                </div>

                {/* Unread indicator + last message time */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {hasMessages && (
                    <span className="text-[10px] font-mono text-on-surface-variant/50">
                      {formatLastMessageTime(meta.lastMessageAt)}
                    </span>
                  )}
                  {isUnread ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-on-surface-variant/50 shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
