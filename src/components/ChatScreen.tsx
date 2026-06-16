import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { MatchSession, UserProfile, ChatMessage } from '../types';
import { sendMessage, subscribeToMessages, markChatRead } from '../chat';

interface ChatScreenProps {
  session: MatchSession;
  currentUser: UserProfile;
  onBack: () => void;
}

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateDivider(ms: number): string {
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function ChatScreen({ session, currentUser, onBack }: ChatScreenProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isParticipant =
    session.host.id === currentUser.id ||
    session.playersJoined.some((p) => p.id === currentUser.id);

  useEffect(() => {
    setSubscribeError(null);
    return subscribeToMessages(
      session.id,
      (msgs) => { setSubscribeError(null); setMessages(msgs); },
      (err) => { console.error('Chat error:', err); setSubscribeError(err.message); }
    );
  }, [session.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark as read whenever messages load or a new one arrives while this chat is open.
  useEffect(() => {
    if (!isParticipant || messages.length === 0) return;
    markChatRead(session.id, currentUser.id).catch((err) => console.error('Mark read error:', err));
  }, [session.id, currentUser.id, isParticipant, messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError(null);
    setInput('');
    try {
      await sendMessage(session.id, currentUser.id, currentUser.name, currentUser.avatar, text);
    } catch (err) {
      console.error('Send error:', err);
      setInput(text);
      setSendError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date for dividers
  const groupedMessages: { divider?: string; message?: ChatMessage }[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const dateLabel = formatDateDivider(msg.createdAt);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ divider: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ message: msg });
  }

  const sessionTitle =
    session.sport === 'Football' && session.footballFormat
      ? `${session.sport} ${session.footballFormat}`
      : `${session.sport} ${session.matchType === 'singles' ? 'Singles' : 'Doubles'}`;

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      {/* Header */}
      <header className="bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-3 px-4 h-16 max-w-3xl mx-auto w-full">
          <button
            onClick={onBack}
            className="text-on-surface hover:bg-surface-variant/50 p-2 rounded-full transition-all active:scale-95 flex items-center justify-center cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-sans font-extrabold text-sm uppercase tracking-widest text-primary-fixed truncate">
              Session Chat
            </div>
            <div className="text-[10px] font-mono text-on-surface-variant truncate">
              {sessionTitle} · {session.venue}
            </div>
          </div>
        </div>
      </header>

      {/* Subscribe error banner */}
      {subscribeError && (
        <div className="bg-error-container/80 text-on-error-container text-xs px-4 py-2 text-center shrink-0">
          Could not load messages: {subscribeError}
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 max-w-3xl mx-auto w-full">
        {messages.length === 0 && !subscribeError && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2 opacity-50 pt-20">
            <div className="text-4xl">💬</div>
            <p className="font-sans font-bold text-sm text-on-surface-variant uppercase tracking-wider">
              No messages yet
            </p>
            <p className="text-xs text-on-surface-variant">
              {isParticipant ? 'Be the first to say something!' : 'Join the session to participate in chat.'}
            </p>
          </div>
        )}

        {groupedMessages.map((item, idx) => {
          if (item.divider) {
            return (
              <div key={`divider-${idx}`} className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-outline-variant/20" />
                <span className="text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-wider shrink-0">
                  {item.divider}
                </span>
                <div className="flex-1 h-px bg-outline-variant/20" />
              </div>
            );
          }

          const msg = item.message!;
          const isMine = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isMine && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/30 mb-0.5"
                />
              )}
              <div className={`flex flex-col gap-0.5 max-w-[72%] ${isMine ? 'items-end' : 'items-start'}`}>
                {!isMine && (
                  <span className="text-[10px] font-bold text-on-surface-variant/70 px-1">
                    {msg.senderName}
                  </span>
                )}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMine
                      ? 'bg-primary-fixed text-on-primary-fixed rounded-br-sm'
                      : 'bg-surface-container-high text-on-surface rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant/40 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 px-4 py-3 pb-safe max-w-3xl mx-auto w-full">
        {sendError && (
          <p className="text-xs text-red-400 mb-2 text-center">{sendError}</p>
        )}
        {isParticipant ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the group..."
              maxLength={500}
              className="flex-1 bg-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 text-sm px-4 py-2.5 rounded-full border border-outline-variant/30 outline-none focus:border-primary-fixed/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-fixed-dim active:scale-95 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-on-surface-variant/60 py-2">
            Join the session to participate in chat
          </div>
        )}
      </div>
    </div>
  );
}
