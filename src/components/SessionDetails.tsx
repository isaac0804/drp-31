import { MatchSession, Player } from '../types';
import { ArrowLeft, Calendar, MapPin, Smile, Dumbbell, Flame, Check, Plus, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface SessionDetailsProps {
  session: MatchSession;
  currentUser: Player;
  onBack: () => void;
  onJoin: (sessionId: string) => void;
  onLeave: (sessionId: string) => void;
}

export default function SessionDetails({
  session,
  currentUser,
  onBack,
  onJoin,
  onLeave
}: SessionDetailsProps) {
  const isJoined = session.playersJoined.some((p) => p.id === currentUser.id);
  const isHost = session.host.id === currentUser.id;
  const spotsFilled = session.playersJoined.length;
  const maxPlayers = session.maxPlayers;
  const isFull = spotsFilled >= maxPlayers;

  // Calculate percentage for progress meter
  const fillPercentage = Math.min((spotsFilled / maxPlayers) * 100, 100);

  // Array of slots displaying players or "+ Open Slot"
  const slots = Array.from({ length: maxPlayers }).map((_, index) => {
    const playerJoined = session.playersJoined[index];
    if (playerJoined) {
      const isPlayerHost = playerJoined.id === session.host.id;
      return {
        type: 'player' as const,
        id: playerJoined.id,
        name: playerJoined.name,
        avatar: playerJoined.avatar,
        isHost: isPlayerHost
      };
    }
    return {
      type: 'open' as const,
      index
    };
  });

  // Calculate duration string
  const calculateDuration = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      const diffMin = endMin - startMin;
      if (diffMin > 0) {
        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        return m > 0 ? `${h}h ${m}m` : `${h} Hours`;
      }
    } catch (e) {
      // Fallback
    }
    return '2.0 Hours';
  };

  const formattedDuration = calculateDuration(session.timeStart, session.timeEnd);

  // Custom date presenter matching design:
  const getVerboseDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
      }
    } catch (e) {}
    return 'Friday, Oct 27';
  };

  return (
    <article className="pb-36">
      {/* Top sticky navigation bar */}
      <header className="fixed top-0 left-0 w-full z-45 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="text-on-surface hover:bg-surface-variant/50 p-2 rounded-full transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-sans font-extrabold text-sm md:text-base uppercase tracking-widest text-primary-fixed">
            Session Details
          </div>
          <div className="w-10"></div> {/* Spacer balance */}
        </div>
      </header>

      {/* Hero Image Section with cover, action blur, and dark custom overlays */}
      <section className="relative h-64 md:h-80 w-full overflow-hidden mt-16 rounded-b-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXu5nimZliHOtcr9LNZzpZFUEu2EbVvyOH6V6RZ7FgnmXg6lH_XDhrZ9FwFa8ilM7HMfm3ZbDOBPMUvlfaoAh3FFqtmzx8y74dU7NUVYtkqNRIr7qe65iauCAE6tW5ripVsaRQloKkkXg3F5EnR1Uc-IXTt58TIXtpVM97M1ptvnkcUusfYQjygOJoWD6fl-rVX6ITqZrLnXVb6XIRRDnKP2mbL6TNetQdzn3_SSEDoadOj_t79KHfwkIUquL5voyIePZrp7u05IhEl0')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Overlaid badminton visual badges */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-primary-container/20 text-primary-fixed text-[10px] font-sans font-extrabold px-3 py-1 rounded-full uppercase border border-primary-fixed/30 backdrop-blur-md tracking-wider">
              {session.skillLevel}
            </span>
            <span className="bg-surface-variant text-on-surface text-[10px] font-sans font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {session.matchType}
            </span>
          </div>
          <h1 className="font-sans font-black text-2xl md:text-3xl text-primary leading-tight uppercase tracking-tight">
            Badminton {session.matchType === 'singles' ? 'Singles Duel' : 'Doubles Match'}
          </h1>
        </div>
      </section>

      {/* Content layout Wrapper */}
      <div className="py-6 space-y-6">
        {/* Date, Time, Venue card */}
        <div className="bg-surface-container-high rounded-xl p-4 shadow-xl flex flex-col gap-4 border border-outline-variant/15">
          {/* Calendar row */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-fixed shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sans font-bold text-sm md:text-base text-on-surface">
                {getVerboseDate(session.date)}
              </div>
              <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                {session.timeStart} - {session.timeEnd} ({formattedDuration})
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/20 w-full" />

          {/* Venue Location Row */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-fixed shrink-0 animate-pulse">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="font-sans font-bold text-sm md:text-base text-on-surface">
                {session.venue}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-0.5">
                {session.address}
              </div>
            </div>
          </div>
        </div>

        {/* Players Slot Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="font-sans font-extrabold text-sm md:text-base uppercase tracking-wider text-on-surface">
              Players Lineup
            </h2>
            <span className="font-sans font-black text-[10px] tracking-widest text-primary-fixed bg-primary-container/10 px-2 py-0.5 rounded uppercase">
              {isFull ? 'FULLY BOOKED' : `${spotsFilled}/${maxPlayers} SPOTS FILLED`}
            </span>
          </div>

          {/* Graphical custom percentage bar */}
          <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden border border-outline-variant/10">
            <div
              className="bg-primary-fixed h-full rounded-full transition-all duration-300"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>

          {/* Slots visual grid layout mimicking screenshots */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {slots.map((slot, sIdx) => {
              if (slot.type === 'player') {
                return (
                  <div
                    key={slot.id || sIdx}
                    className={`flex flex-col items-center gap-2 p-3 bg-surface-container-low rounded-lg border-2 relative select-none ${
                      slot.isHost ? 'border-primary-fixed/50' : 'border-outline-variant/20'
                    }`}
                  >
                    {slot.isHost && (
                      <div className="absolute -top-2 bg-primary-fixed text-on-primary-fixed font-sans font-black text-[9px] leading-tight px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                        Host
                      </div>
                    )}
                    <img
                      alt={slot.name}
                      referrerPolicy="no-referrer"
                      className={`w-12 h-12 rounded-full object-cover ${
                        slot.isHost ? 'border-2 border-primary-fixed' : ''
                      }`}
                      src={slot.avatar}
                    />
                    <div className="text-center">
                      <div className="font-sans font-bold text-xs text-on-surface max-w-[120px] truncate">
                        {slot.name}
                      </div>
                      <div className="text-[9px] font-mono text-on-surface-variant uppercase mt-0.5">
                        {slot.isHost ? 'Level Pro' : 'Athlete'}
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={sIdx}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-surface border-2 border-dashed border-outline-variant/30 rounded-lg opacity-60 min-h-[96px] select-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div className="font-sans text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Open Slot
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </section>

        {/* Host Quote Note */}
        <section className="space-y-2">
          <h2 className="font-sans font-extrabold text-sm uppercase tracking-wider text-on-surface">
            Host Note
          </h2>
          <div className="bg-surface-container-low p-4 rounded-lg border-l-4 border-primary-fixed">
            <p className="font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed italic">
              "{session.hostNote}"
            </p>
          </div>
        </section>
      </div>

      {/* Stationary Bottom Fixed Action CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 pb-safe bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 z-40">
        <div className="w-full max-w-3xl mx-auto flex gap-3">
          {isHost ? (
            <div className="w-full text-center text-xs font-sans text-on-surface-variant py-4 bg-surface-container-highest rounded-full border border-outline-variant/20">
              You are the host of this match session
            </div>
          ) : isJoined ? (
            <button
              onClick={() => onLeave(session.id)}
              className="w-full bg-error-container hover:bg-error-container/80 text-white font-sans font-black text-xs uppercase tracking-widest py-4 rounded-full shadow-[0_4px_16px_rgba(147,0,10,0.25)] hover:scale-101 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Leave court session
            </button>
          ) : (
            <button
              onClick={() => onJoin(session.id)}
              disabled={isFull}
              className={`w-full font-sans font-black text-xs uppercase tracking-widest py-4 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isFull
                  ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                  : 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim shadow-[0_4px_20px_rgba(202,243,0,0.3)] hover:scale-101 active:scale-98'
              }`}
            >
              {isFull ? 'Match is full' : 'Join court session'}
              {!isFull && <Trophy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
