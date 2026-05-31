import { useState, useEffect, FormEvent } from 'react';
import { MatchSession, SkillLevel, MatchType } from '../types';
import { Calendar, Clock, MapPin, Smile, Dumbbell, Flame, Plus, Minus, Check, ArrowLeft, AlignLeft } from 'lucide-react';

interface HostScreenProps {
  onPostSession: (session: Omit<MatchSession, 'id' | 'host' | 'playersJoined'>) => void;
  onUpdateSession: (id: string, updatedFields: Partial<MatchSession>) => void;
  editingSession?: MatchSession | null;
  onCancelEdit?: () => void;
}

export default function HostScreen({
  onPostSession,
  onUpdateSession,
  editingSession,
  onCancelEdit
}: HostScreenProps) {
  const isEditing = !!editingSession;

  // Controlled states loaded from existing session or sensible defaults
  const [date, setDate] = useState('2024-10-24');
  const [timeStart, setTimeStart] = useState('18:00');
  const [timeEnd, setTimeEnd] = useState('20:00');
  const [venue, setVenue] = useState('');
  const [address, setAddress] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [matchType, setMatchType] = useState<MatchType>('doubles');
  const [playersNeeded, setPlayersNeeded] = useState(3);
  const [hostNote, setHostNote] = useState('');

  // Synchronize state when editing session switches
  useEffect(() => {
    if (editingSession) {
      setDate(editingSession.date);
      setTimeStart(editingSession.timeStart);
      setTimeEnd(editingSession.timeEnd);
      setVenue(editingSession.venue);
      setAddress(editingSession.address);
      setSkillLevel(editingSession.skillLevel);
      setMatchType(editingSession.matchType);
      
      // Calculate players needed based on the maximum slots
      setPlayersNeeded(editingSession.maxPlayers);
      setHostNote(editingSession.hostNote);
    } else {
      // Sensible defaults
      setDate(new Date().toISOString().split('T')[0]);
      setTimeStart('18:30');
      setTimeEnd('20:30');
      setVenue('');
      setAddress('');
      setSkillLevel('intermediate');
      setMatchType('doubles');
      setPlayersNeeded(3);
      setHostNote('');
    }
  }, [editingSession]);

  // Adjust max players automatically when match type changes
  const handleMatchTypeChange = (type: MatchType) => {
    setMatchType(type);
    if (!isEditing) {
      // Default singles to 2 players maximum, doubles to 4
      setPlayersNeeded(type === 'singles' ? 2 : 4);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!venue.trim()) {
      alert('Please specify a badminton court venue name.');
      return;
    }

    const compiledData = {
      date,
      timeStart,
      timeEnd,
      venue,
      address: address || 'Main Badminton Arena, Court 1',
      skillLevel,
      matchType,
      maxPlayers: playersNeeded,
      hostNote: hostNote || `Friendly ${skillLevel} ${matchType} game! Come join us.`
    };

    if (isEditing && editingSession) {
      onUpdateSession(editingSession.id, compiledData);
    } else {
      onPostSession(compiledData);
    }
  };

  return (
    <article className="space-y-6">
      {/* Page Title Header */}
      <section className="space-y-1">
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={onCancelEdit}
              className="p-1 rounded-full text-on-surface hover:bg-surface-variant transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
            {isEditing ? 'Edit Badminton Match' : 'Host a Badminton Match'}
          </h2>
        </div>
        <p className="text-sm text-on-surface-variant/80">
          {isEditing
            ? 'Update the game details of your current match arrangement.'
            : 'Set up the court, find your partner, and smash.'}
        </p>
      </section>

      {/* Main Glassmorphism Styled Container Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-surface-container-high p-5 md:p-6 rounded-xl border border-outline-variant/15 shadow-xl"
      >
        {/* Date & Time Picker Group */}
        <div className="grid grid-cols-2 gap-4">
          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Date
            </label>
            <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <span className="pl-3 text-on-surface-variant shrink-0">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none [&::-webkit-calendar-picker-indicator]:invert-[0.8] cursor-pointer"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Start Time
            </label>
            <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <span className="pl-3 text-on-surface-variant shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <input
                type="time"
                required
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none inline-block"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Duration or Time End Row to match screenshot styling */}
        <div className="grid grid-cols-2 gap-4">
          {/* Time End */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              End Time
            </label>
            <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <span className="pl-3 text-on-surface-variant shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <input
                type="time"
                required
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 appearance-none inline-block"
              />
            </div>
          </div>

          {/* Gameplay Match Type Selector */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Match Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleMatchTypeChange('singles')}
                className={`py-3 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                  matchType === 'singles'
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                }`}
              >
                Singles (1v1)
              </button>
              <button
                type="button"
                onClick={() => handleMatchTypeChange('doubles')}
                className={`py-3 rounded-lg text-xs font-bold uppercase border transition-all cursor-pointer ${
                  matchType === 'doubles'
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'bg-surface-variant/30 text-on-surface-variant/80 border-outline-variant/40 hover:bg-surface-bright'
                }`}
              >
                Doubles (2v2)
              </button>
            </div>
          </div>
        </div>

        {/* Venue Information Field */}
        <div className="space-y-1.5">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Venue Name
          </label>
          <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
            <span className="pl-3 text-on-surface-variant shrink-0">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              required
              placeholder="e.g. Downtown Sports Hub"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Detailed Address Location Field */}
        <div className="space-y-1.5">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Court No / Address Details
          </label>
          <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
            <span className="pl-3 text-on-surface-variant shrink-0">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="e.g. Court 3 • 123 Smash Ave, Metro"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Skill Level Selection (Glassmorphism Cards matching screenshot exactly) */}
        <div className="space-y-1.5">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Skill Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Beginner Card */}
            <button
              type="button"
              onClick={() => setSkillLevel('beginner')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                skillLevel === 'beginner'
                  ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed'
                  : 'border-outline-variant/50 bg-surface-variant text-on-surface-variant hover:bg-surface-bright text-on-surface'
              }`}
            >
              <Smile className="w-5 h-5 mb-1" />
              <span className="font-sans font-black text-[10px] uppercase tracking-wider">Beginner</span>
            </button>

            {/* Intermediate Card */}
            <button
              type="button"
              onClick={() => setSkillLevel('intermediate')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                skillLevel === 'intermediate'
                  ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed'
                  : 'border-outline-variant/50 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              <Dumbbell className="w-5 h-5 mb-1" />
              <span className="font-sans font-black text-[10px] uppercase tracking-wider">Intermediate</span>
            </button>

            {/* Advanced / Pro Card */}
            <button
              type="button"
              onClick={() => setSkillLevel('pro')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                skillLevel === 'pro'
                  ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed'
                  : 'border-outline-variant/50 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
              }`}
            >
              <Flame className="w-5 h-5 mb-1" />
              <span className="font-sans font-black text-[10px] uppercase tracking-wider">Advanced</span>
            </button>
          </div>
        </div>

        {/* Number of Pax (Stepper control with styled buttons) */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Total Court Slots Available
            </label>
            <span className="text-xs text-on-surface-variant font-mono">
              (Capacity caps at 10)
            </span>
          </div>
          <div className="flex items-center justify-between bg-surface-variant/50 rounded-lg border border-outline-variant/40 p-2">
            <button
              onClick={() => setPlayersNeeded((prev) => Math.max(1, prev - 1))}
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-bright text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-sans font-black text-lg text-on-surface w-16 text-center">
              {playersNeeded}
            </span>
            <button
              onClick={() => setPlayersNeeded((prev) => Math.min(10, prev + 1))}
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-md bg-surface-bright text-on-surface hover:bg-surface-container transition-colors active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Note Area */}
        <div className="space-y-1.5">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Host Message / Note For Players
          </label>
          <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-start focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
            <span className="pl-3 pt-3 text-on-surface-variant shrink-0">
              <AlignLeft className="w-4 h-4" />
            </span>
            <textarea
              placeholder="e.g. Bring your own racket, shuttlecocks provided. Looking for a nice active game!"
              rows={3}
              value={hostNote}
              onChange={(e) => setHostNote(e.target.value)}
              className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50 resize-none"
            />
          </div>
        </div>

        {/* Action Button Area */}
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
    </article>
  );
}
