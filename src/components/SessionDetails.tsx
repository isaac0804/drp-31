import { MatchSession, Player, UserProfile, SkillLevel, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../types';
import { ArrowLeft, Calendar, MapPin, Plus, Trophy, Pencil, CalendarPlus, Navigation } from 'lucide-react';

interface SessionDetailsProps {
  session: MatchSession;
  currentUser: UserProfile;
  onBack: () => void;
  onJoin: (sessionId: string) => void;
  onLeave: (sessionId: string) => void;
  onViewPlayerProfile: (player: Player) => void;
  onEdit?: (session: MatchSession) => void;
}

export default function SessionDetails({
  session,
  currentUser,
  onBack,
  onJoin,
  onLeave,
  onViewPlayerProfile,
  onEdit,
}: SessionDetailsProps) {
  const isJoined = session.playersJoined.some((p) => p.id === currentUser.id);
  const isHost = session.host.id === currentUser.id;
  const spotsFilled = session.playersJoined.length;
  const maxPlayers = session.maxPlayers;
  const isFull = spotsFilled >= maxPlayers;

  const userSportLevel = currentUser.skillsBySport?.[session.sport]?.skillLevel ?? currentUser.skillLevel;
  const safeLabel = (level: string | undefined) =>
    level ? (SKILL_LEVEL_LABELS[level as SkillLevel] ?? level) : '';
  const minIdx = SKILL_LEVELS.indexOf(session.skillLevel);
  const maxIdx = SKILL_LEVELS.indexOf(session.skillLevelMax ?? session.skillLevel);
  const userIdx = SKILL_LEVELS.indexOf(userSportLevel);
  // Old sessions may have a skill level not in the new list; always allow joining those
  const levelMatch = minIdx === -1 || (userIdx >= minIdx && userIdx <= maxIdx);
  const skillRangeLabel = session.skillLevelMax && session.skillLevelMax !== session.skillLevel
    ? `${safeLabel(session.skillLevel)} – ${safeLabel(session.skillLevelMax)}`
    : safeLabel(session.skillLevel);

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
        skillLevel: playerJoined.skillLevel,
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

  const buildGCalUrl = (s: MatchSession) => {
    const fmt = (d: string, t: string) => d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${s.sport} ${s.matchType} · ${s.skillLevel}`,
      dates: `${fmt(s.date, s.timeStart)}/${fmt(s.date, s.timeEnd)}`,
      details: `Hosted by ${s.host.name}\n\n${s.hostNote}`,
      location: s.address,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Open the venue in Google Maps. Prefer precise coordinates when the session
  // has a pinned location, otherwise fall back to a text search of the address.
  const buildMapsUrl = (s: MatchSession) => {
    const query = s.location
      ? `${s.location.lat},${s.location.lng}`
      : `${s.venue} ${s.address}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

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
    <article className="pb-52 md:pb-36">
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

      {/* Hero gradient section */}
      <section className="relative pt-20 pb-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/15 via-surface to-surface pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary-fixed/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary-fixed/15 text-primary-fixed text-[10px] font-sans font-extrabold px-3 py-1 rounded-full uppercase border border-primary-fixed/30 tracking-wider">
              {skillRangeLabel}
            </span>
            <span className="bg-surface-variant text-on-surface text-[10px] font-sans font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              {session.sport === 'Football' && session.footballFormat ? session.footballFormat : session.matchType}
            </span>
          </div>
          <h1 className="font-sans font-black text-2xl md:text-3xl text-white leading-tight uppercase tracking-tight">
            {session.sport === 'Football' && session.footballFormat
              ? `${session.sport} ${session.footballFormat}`
              : `${session.sport} ${session.matchType === 'singles' ? 'Singles' : 'Doubles'}`
            }
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
            <div className="flex-1">
              <div className="font-sans font-bold text-sm md:text-base text-on-surface">
                {getVerboseDate(session.date)}
              </div>
              <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                {session.timeStart} - {session.timeEnd} ({formattedDuration})
              </div>
            </div>
            {isHost && (
              <button
                onClick={() => onEdit?.(session)}
                aria-label="Edit session"
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary-fixed hover:bg-primary-fixed/10 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="h-px bg-outline-variant/20 w-full" />

          {/* Venue Location Row */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-fixed shrink-0 animate-pulse">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-sans font-bold text-sm md:text-base text-on-surface">
                {session.venue}
              </div>
              <div className="font-sans text-xs text-on-surface-variant mt-0.5">
                {session.address}
              </div>
              <a
                href={buildMapsUrl(session)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold text-on-surface-variant hover:text-primary-fixed transition-colors group"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0 group-hover:text-primary-fixed" />
                Open in Google Maps
              </a>
            </div>
            {isHost && (
              <button
                onClick={() => onEdit?.(session)}
                aria-label="Edit location"
                className="p-2 rounded-lg text-on-surface-variant hover:text-primary-fixed hover:bg-primary-fixed/10 transition-colors cursor-pointer shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="h-px bg-outline-variant/20 w-full" />

          <a
            href={buildGCalUrl(session)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary-fixed transition-colors group"
          >
            <CalendarPlus className="w-4 h-4 shrink-0 group-hover:text-primary-fixed" />
            Add to Google Calendar
          </a>
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
                  <button
                    type="button"
                    onClick={() => onViewPlayerProfile(slot)}
                    key={slot.id || sIdx}
                    className={`flex flex-col items-center gap-3 p-4 bg-surface-container-low rounded-xl border-2 relative select-none transition-all hover:scale-[1.02] cursor-pointer ${
                      slot.isHost ? 'border-primary-fixed/50' : 'border-outline-variant/20'
                    }`}
                  >
                    {slot.isHost && (
                      <div className="absolute -top-2.5 bg-primary-fixed text-on-primary-fixed font-sans font-black text-[9px] leading-tight px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                        Host
                      </div>
                    )}
                    <img
                      alt={slot.name}
                      referrerPolicy="no-referrer"
                      className={`w-16 h-16 rounded-full object-cover ${
                        slot.isHost ? 'border-2 border-primary-fixed' : ''
                      }`}
                      src={slot.avatar}
                    />
                    <div className="text-center">
                      <div className="font-sans font-bold text-sm text-on-surface max-w-[120px] truncate">
                        {slot.name}
                      </div>
                      <div className="text-[10px] font-mono text-primary-fixed/80 uppercase tracking-wider mt-0.5">
                        {safeLabel(slot.skillLevel ?? session.skillLevel)}
                      </div>
                    </div>
                  </button>
                );
              } else {
                return (
                  <div
                    key={sIdx}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-surface border-2 border-dashed border-outline-variant/30 rounded-xl opacity-60 min-h-[120px] select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <Plus className="w-5 h-5" />
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
      <div className="fixed bottom-20 md:bottom-0 left-0 w-full p-4 pb-safe bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 z-40">
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
            <div className="w-full flex flex-col items-center gap-2">
              <button
                onClick={() => onJoin(session.id)}
                disabled={isFull || !levelMatch}
                className={`w-full font-sans font-black text-xs uppercase tracking-widest py-4 rounded-full transition-all flex items-center justify-center gap-2 ${
                  isFull || !levelMatch
                    ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                    : 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim shadow-[0_4px_20px_rgba(202,243,0,0.3)] hover:scale-101 active:scale-98 cursor-pointer'
                }`}
              >
                {isFull ? 'Match is full' : !levelMatch ? `${skillRangeLabel} only` : 'Join session'}
                {!isFull && levelMatch && <Trophy className="w-4 h-4" />}
              </button>
              {!isFull && !levelMatch && (
                <p className="text-[11px] text-on-surface-variant/70 text-center">
                  Your {session.sport} level is <span className="text-primary-fixed font-bold">{userSportLevel}</span> — this session requires <span className="font-bold text-on-surface">{session.skillLevel}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
