import React, { useState, useEffect, FormEvent } from 'react';
import { MatchSession, SkillLevel, MatchType, GenderPreference, Sport, SessionLocation, FootballFormat, UserGender, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../types';
import { SPORTS } from '../data';
import { Calendar, Clock, MapPin, Plus, Minus, Check, ArrowLeft, AlignLeft, User, Users, Globe, Lock, Copy } from 'lucide-react';
import LocationPicker from './LocationPicker';
import SkillRangePicker from './SkillRangePicker';

const getLocalDateString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getDefaultTimes = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  if (h < 17) return { start: '18:30', end: '20:30' };
  const startH = m < 30 ? h : h + 1;
  const startM = m < 30 ? 30 : 0;
  if (startH + 2 >= 24) return { start: '18:30', end: '20:30' };
  const fmt = (hh: number, mm: number) =>
    `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  return { start: fmt(startH, startM), end: fmt(startH + 2, startM) };
};

type FootballFormatOption = '5-a-side' | '7-a-side' | '11-a-side';

const SPORT_META: Record<Sport, { tagline: string; emoji: string; gradient: string }> = {
  'Badminton':    { tagline: 'Set up the court, find your partner, and smash.',   emoji: '🏸', gradient: 'bg-gradient-to-br from-surface-container-highest to-primary-fixed/25' },
  'Table Tennis': { tagline: 'Pick a table, grab a paddle, and rally.',            emoji: '🏓', gradient: 'bg-gradient-to-bl from-surface-container-highest to-primary-fixed/25' },
  'Football':     { tagline: 'Organise the squad, book the pitch, and play.',      emoji: '⚽', gradient: 'bg-gradient-to-tr from-surface-container-highest to-primary-fixed/25' },
  'Pickleball':   { tagline: 'Find the court, rally up, and dink.',                emoji: '🎾', gradient: 'bg-gradient-to-tl from-surface-container-highest to-primary-fixed/25' },
};

const FOOTBALL_FORMATS: { label: FootballFormatOption; total: number; note: string; display: FootballFormat }[] = [
  { label: '5-a-side',  total: 10, note: '5v5 · compact', display: '5v5' },
  { label: '7-a-side',  total: 14, note: '7v7 · mid-size', display: '7v7' },
  { label: '11-a-side', total: 22, note: '11v11 · full', display: '11v11' },
];

const inferFootballFormat = (players: number): FootballFormatOption => {
  if (players >= 20) return '11-a-side';
  if (players >= 12) return '7-a-side';
  return '5-a-side';
};
interface HostScreenProps {
  onPostSession: (session: Omit<MatchSession, 'host' | 'playersJoined'>) => void;
  onUpdateSession: (id: string, updatedFields: Partial<MatchSession>) => void;
  editingSession?: MatchSession | null;
  onCancelEdit?: () => void;
  hostGender?: UserGender;
}

export default function HostScreen({
  onPostSession,
  onUpdateSession,
  editingSession,
  onCancelEdit,
  hostGender,
}: HostScreenProps) {
  const isEditing = !!editingSession;

  const [step, setStep] = useState<'sport-select' | 'details'>(editingSession ? 'details' : 'sport-select');
  const [date, setDate] = useState(() => getLocalDateString());
  const [timeStart, setTimeStart] = useState(() => getDefaultTimes().start);
  const [timeEnd, setTimeEnd] = useState(() => getDefaultTimes().end);
  const [location, setLocation] = useState<SessionLocation | null>(null);
  const [sport, setSport] = useState<Sport>('Badminton');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('lower-intermediate');
  const [skillLevelMax, setSkillLevelMax] = useState<SkillLevel>('upper-intermediate');
  const [matchType, setMatchType] = useState<MatchType>('doubles');
  const [footballFormat, setFootballFormat] = useState<FootballFormatOption>('5-a-side');
  const [gender, setGender] = useState<GenderPreference>('open');
  const [playersNeeded, setPlayersNeeded] = useState(4);
  const [hostNote, setHostNote] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}`);
  const [copied, setCopied] = useState(false);
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const inviteLink = `${window.location.origin}/?invite=${sessionId}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handlePrivacyChange = (priv: boolean) => {
    setIsPrivate(priv);
    if (priv) {
      setShowInvitePopup(true);
      copyInviteLink();
    }
  };

  const today = getLocalDateString();

  const snapPlayersToMatchType = (type: MatchType, current: number) => {
    const min = type === 'singles' ? 2 : 4;
    return Math.max(min, current);
  };

  const getDuration = (start: string, end: string): string => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = eh * 60 + em - (sh * 60 + sm);
    if (diff <= 0) return '';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  useEffect(() => {
    if (editingSession) {
      setStep('details');
      setDate(editingSession.date);
      setTimeStart(editingSession.timeStart);
      setTimeEnd(editingSession.timeEnd);
      setLocation(editingSession.location ?? null);
      setSport(editingSession.sport);
      setSkillLevel(editingSession.skillLevel);
      setSkillLevelMax(editingSession.skillLevelMax ?? editingSession.skillLevel);
      setMatchType(editingSession.matchType);
      setGender(editingSession.gender ?? 'open');
      setPlayersNeeded(snapPlayersToMatchType(editingSession.matchType, editingSession.maxPlayers));
      setHostNote(editingSession.hostNote);
      setIsPrivate(editingSession.isPrivate ?? false);
      setSessionId(editingSession.id);
      if (editingSession.sport === 'Football') {
        setFootballFormat(inferFootballFormat(editingSession.maxPlayers));
      }
    } else {
      const { start, end } = getDefaultTimes();
      setStep('sport-select');
      setDate(getLocalDateString());
      setTimeStart(start);
      setTimeEnd(end);
      setLocation(null);
      setSport('Badminton');
      setSkillLevel('lower-intermediate');
      setSkillLevelMax('upper-intermediate');
      setMatchType('doubles');
      setFootballFormat('5-a-side');
      setGender('open');
      setPlayersNeeded(4);
      setHostNote('');
      setIsPrivate(false);
      setSessionId(`session_${Date.now()}`);
    }
  }, [editingSession]);

  const handleSportSelect = (s: Sport) => {
    setSport(s);
    if (s === 'Football') {
      setMatchType('doubles');
      setPlayersNeeded(10);
      setFootballFormat('5-a-side');
    } else {
      setMatchType('doubles');
      setPlayersNeeded(4);
    }
    setStep('details');
  };

  const handleFootballFormatChange = (format: FootballFormatOption) => {
    setFootballFormat(format);
    const totals: Record<FootballFormatOption, number> = { '5-a-side': 10, '7-a-side': 14, '11-a-side': 22 };
    setPlayersNeeded(totals[format]);
  };

  const footballFormatMin = sport === 'Football'
    ? (FOOTBALL_FORMATS.find(f => f.label === footballFormat)?.total ?? 10)
    : null;
  const minPlayers = footballFormatMin ?? (matchType === 'singles' ? 2 : 4);
  const maxPlayers = 30;

  const handleMatchTypeChange = (type: MatchType) => {
    setMatchType(type);
    setPlayersNeeded((prev) => snapPlayersToMatchType(type, prev));
  };

  const handleDecrement = () => {
    setPlayersNeeded((prev) => Math.max(minPlayers, prev - 1));
  };

  const handleIncrement = () => {
    setPlayersNeeded((prev) => Math.min(maxPlayers, prev + 1));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!location) {
      alert('Please select a venue on the map.');
      return;
    }

    if (date < today) {
      alert('Session date cannot be in the past.');
      return;
    }

    if (date === today) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (timeStart <= currentTime) {
        alert("Start time must be in the future for today's sessions.");
        return;
      }
    }

    if (timeEnd <= timeStart) {
      alert('End time must be after start time.');
      return;
    }

    const compiledData = {
      id: sessionId,
      date,
      timeStart,
      timeEnd,
      venue: location.name,
      address: location.address,
      sport,
      location,
      skillLevel,
      skillLevelMax,
      matchType,
      ...(sport === 'Football' ? { footballFormat: FOOTBALL_FORMATS.find(f => f.label === footballFormat)?.display } : {}),
      gender,
      maxPlayers: playersNeeded,
      hostNote: hostNote || `Friendly ${skillLevel} ${sport} game! Come join us.`,
      isPrivate,
    };

    if (isEditing && editingSession) {
      onUpdateSession(editingSession.id, compiledData);
    } else {
      onPostSession(compiledData);
    }
  };

  const duration = getDuration(timeStart, timeEnd);

  return (
    <article className="space-y-6 pt-0">
      {/* Page Title Header */}
      <section className="space-y-1 mt-0">
        <div className="flex items-center gap-2">
          {(isEditing || step === 'details') && (
            <button
              onClick={step === 'details' && !isEditing ? () => setStep('sport-select') : onCancelEdit}
              className="p-1 rounded-full text-on-surface hover:bg-surface-variant transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
            {isEditing ? 'Edit Session' : 'Host a Session'}
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant/80">
          {isEditing
            ? 'Update the game details of your current match arrangement.'
            : step === 'sport-select'
            ? 'What sport do you want to play?'
            : SPORT_META[sport].tagline}
        </p>
      </section>

      {step === 'sport-select' ? (
        /* ── Step 1: Sport Selection ── */
        <div className="grid grid-cols-2 gap-3">
          {SPORTS.map((s) => {
            const meta = SPORT_META[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSportSelect(s)}
                className={`relative overflow-hidden flex flex-col items-start gap-2 p-5 rounded-xl border border-outline-variant/20 hover:border-primary-fixed/55 transition-all active:scale-95 cursor-pointer group ${meta.gradient}`}
              >
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-primary-fixed/10 blur-xl group-hover:bg-primary-fixed/20 transition-all pointer-events-none" />
                <span className="text-3xl">{meta.emoji}</span>
                <span className="font-sans font-black text-sm uppercase tracking-wider text-on-surface group-hover:text-primary-fixed transition-colors">
                  {s}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Step 2: Session Details Form ── */
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-surface-container-high p-5 md:p-6 rounded-xl border border-outline-variant/15 shadow-xl"
        >
          {/* Selected Sport Indicator */}
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
            <span className="font-sans font-black text-sm uppercase tracking-wider text-primary-fixed">{sport}</span>
          </div>

          {/* Date + Match Type (racket sports) OR Date + Format (Football) */}
          {sport !== 'Football' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Date</label>
                <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
                  <span className="pl-3 text-on-surface-variant shrink-0"><Calendar className="w-4 h-4" /></span>
                  <input
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Match Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['singles', 'doubles'] as MatchType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={matchType === t}
                      onClick={() => handleMatchTypeChange(t)}
                      className={`py-3 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                        matchType === t
                          ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                          : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Date</label>
                <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
                  <span className="pl-3 text-on-surface-variant shrink-0"><Calendar className="w-4 h-4" /></span>
                  <input
                    type="date"
                    required
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {FOOTBALL_FORMATS.map(({ label, note }) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={footballFormat === label}
                      onClick={() => handleFootballFormatChange(label)}
                      className={`flex flex-col items-center justify-center gap-0.5 py-3 px-2 rounded-lg border transition-all cursor-pointer ${
                        footballFormat === label
                          ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                          : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                      }`}
                    >
                      <span className="font-sans font-black text-xs uppercase tracking-tight">{label}</span>
                      <span className={`font-mono text-[9px] ${footballFormat === label ? 'text-primary-fixed/70' : 'text-on-surface-variant/50'}`}>{note}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Start Time + End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Start Time</label>
              <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
                <span className="pl-3 text-on-surface-variant shrink-0"><Clock className="w-4 h-4" /></span>
                <input
                  type="time"
                  required
                  value={timeStart}
                  onChange={(e) => setTimeStart(e.target.value)}
                  className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none inline-block"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">End Time</label>
                {duration && <span className="text-[10px] font-mono text-primary-fixed">{duration}</span>}
              </div>
              <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
                <span className="pl-3 text-on-surface-variant shrink-0"><Clock className="w-4 h-4" /></span>
                <input
                  type="time"
                  required
                  value={timeEnd}
                  onChange={(e) => setTimeEnd(e.target.value)}
                  className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none inline-block"
                />
              </div>
            </div>
          </div>

          {/* Location Picker */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Venue / Location
            </label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>

          {/* Skill Level Range */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Skill Level Range</label>
              <span className="font-mono text-[10px] text-primary-fixed">
                {skillLevel === skillLevelMax
                  ? SKILL_LEVEL_LABELS[skillLevel]
                  : `${SKILL_LEVEL_LABELS[skillLevel]} – ${SKILL_LEVEL_LABELS[skillLevelMax]}`}
              </span>
            </div>
            <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-6 pt-6 pb-5">
              <SkillRangePicker
                min={skillLevel}
                max={skillLevelMax}
                onChange={(min, max) => { setSkillLevel(min); setSkillLevelMax(max); }}
              />
            </div>
          </div>

          {/* Gender Preference */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Gender Preference</label>
            {(() => {
              const allOpts = ([
                { value: 'male',   label: 'Male Only',   icon: <User  className="w-5 h-5 mb-1" /> },
                { value: 'female', label: 'Female Only', icon: <User  className="w-5 h-5 mb-1" /> },
                { value: 'open',   label: 'Open to All', icon: <Users className="w-5 h-5 mb-1" /> },
              ] as { value: GenderPreference; label: string; icon: React.ReactNode }[]);
              const oppositeGender = hostGender === 'male' ? 'female' : hostGender === 'female' ? 'male' : null;
              return (
                <div className="grid grid-cols-3 gap-2">
                  {allOpts.map(({ value, label, icon }) => {
                    const isDisabled = value === oppositeGender;
                    return (
                      <div key={value} className="relative group">
                        <button
                          type="button"
                          aria-pressed={gender === value}
                          disabled={isDisabled}
                          onClick={() => !isDisabled && setGender(value)}
                          className={`w-full flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            isDisabled
                              ? 'border-outline-variant/20 bg-surface-variant/30 text-on-surface-variant/30 cursor-not-allowed opacity-50'
                              : gender === value
                              ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed cursor-pointer'
                              : 'border-outline-variant/50 bg-surface-variant text-on-surface-variant hover:bg-surface-bright cursor-pointer'
                          }`}
                        >
                          {icon}
                          <span className="font-sans font-black text-[10px] uppercase tracking-wider">{label}</span>
                        </button>
                        {isDisabled && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2 text-[10px] text-on-surface-variant leading-snug shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            You can only host sessions open to your own gender or all players.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Total Players */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Total Players</label>
              <span className="text-xs text-on-surface-variant font-mono">Min {minPlayers} · max {maxPlayers}</span>
            </div>
            <div className="flex items-center justify-between bg-surface-variant/50 rounded-lg border border-outline-variant/40 p-2">
              <button
                onClick={handleDecrement}
                type="button"
                disabled={playersNeeded <= minPlayers}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-bright text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-sans font-black text-lg text-on-surface w-16 text-center">{playersNeeded}</span>
              <button
                onClick={handleIncrement}
                type="button"
                disabled={playersNeeded >= maxPlayers}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-bright text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Host Note */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Host Message / Note For Players</label>
            <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-start focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <span className="pl-3 pt-3 text-on-surface-variant shrink-0"><AlignLeft className="w-4 h-4" /></span>
              <textarea
                placeholder="e.g. Bring your own racket, shuttlecocks provided. Looking for a nice active game!"
                rows={3}
                value={hostNote}
                onChange={(e) => setHostNote(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50 resize-none"
              />
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Privacy</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={!isPrivate}
                onClick={() => handlePrivacyChange(false)}
                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-lg border transition-all cursor-pointer ${
                  !isPrivate
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                }`}
              >
                <Globe className="w-6 h-6" />
                <span className="font-sans font-black text-[10px] uppercase tracking-wider">Public</span>
              </button>
              <button
                type="button"
                aria-pressed={isPrivate}
                onClick={() => handlePrivacyChange(true)}
                className={`flex flex-col items-center justify-center gap-1 py-4 rounded-lg border transition-all cursor-pointer ${
                  isPrivate
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                }`}
              >
                <Lock className="w-6 h-6" />
                <span className="font-sans font-black text-[10px] uppercase tracking-wider">Private</span>
              </button>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <p className="text-[11px] text-on-surface-variant/70">
                {isPrivate ? 'Only players with the invite link can join.' : 'Visible to everyone.'}
              </p>
              {isPrivate && (
                <button
                  type="button"
                  onClick={() => { setShowInvitePopup(true); copyInviteLink(); }}
                  className="flex items-center gap-1 text-[11px] font-bold text-primary-fixed hover:text-primary-fixed-dim transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  View link
                </button>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-sans font-extrabold text-sm uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_4px_16px_rgba(202,243,0,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3px]" />
              {isEditing ? 'Save Updates' : 'Post Session'}
            </button>
          </div>
        </form>
      )}

      {/* Invite Link Popup */}
      {showInvitePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-5"
          onClick={() => setShowInvitePopup(false)}
        >
          <div
            className="w-full max-w-sm bg-surface-container-high border border-outline-variant/30 rounded-2xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-sans font-black text-sm uppercase tracking-widest text-on-surface">Invite Link</h3>
              <span className={`text-[11px] font-bold transition-opacity ${copied ? 'text-primary-fixed opacity-100' : 'opacity-0'}`}>
                Copied!
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-surface-variant/50 border border-outline-variant/40 px-3 py-2.5">
              <input
                type="text"
                readOnly
                value={inviteLink}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-transparent text-on-surface-variant font-mono text-xs outline-none border-none select-all truncate"
              />
              <button
                type="button"
                onClick={copyInviteLink}
                className="shrink-0 p-1.5 rounded-md bg-surface-bright hover:bg-surface-container text-on-surface transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-primary-fixed" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-on-surface-variant/70">
              Share this link with players you want to invite. Only those with the link can join.
            </p>
            <button
              type="button"
              onClick={() => setShowInvitePopup(false)}
              className="w-full py-3 rounded-full bg-primary-fixed text-on-primary-fixed font-sans font-extrabold text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
