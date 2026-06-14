import { useEffect, useRef, useState } from 'react';
import { Player, MatchSession, PlayAgain, SkillAccuracy, Reliability, Sportsmanship, Vibe } from '../types';
import { ArrowLeft, ThumbsUp, ThumbsDown, TrendingDown, CheckCircle, TrendingUp, Send, Check, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitReview } from '../reviews';

interface ReviewPlayerScreenProps {
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  player: Player;
  session: MatchSession;
  onBack: () => void;
  onSubmit: () => void;
}

type Sentiment = 'positive' | 'neutral' | 'negative';

interface CategoryOption<T extends string> {
  value: T;
  label: string;
  sentiment: Sentiment;
}

const SENTIMENT_ICONS: Record<Sentiment, React.ReactNode> = {
  positive: <Check className="w-3 h-3" />,
  neutral:  <Minus className="w-3 h-3" />,
  negative: <X     className="w-3 h-3" />,
};

function sentimentClass(sentiment: Sentiment, selected: boolean): string {
  if (!selected)
    return 'border-outline-variant/15 bg-surface-container/80 text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface-variant/80';
  if (sentiment === 'positive') return 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed';
  if (sentiment === 'neutral')  return 'border-amber-400 bg-amber-400/10 text-amber-400';
  return 'border-error bg-error/10 text-error';
}

function CategoryPicker<T extends string>({
  step,
  label,
  description,
  options,
  value,
  onChange,
}: {
  step: string;
  label: string;
  description: string;
  options: CategoryOption<T>[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-[10px] font-black text-primary-fixed/50 tracking-widest pt-0.5">{step}</span>
        <div>
          <h3 className="font-bold text-sm text-white">{label}</h3>
          <p className="text-xs text-on-surface-variant/45 mt-0.5 leading-snug">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer leading-tight ${sentimentClass(opt.sentiment, value === opt.value)}`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              value === opt.value ? 'bg-current/15' : 'bg-outline-variant/10'
            }`}>
              {SENTIMENT_ICONS[opt.sentiment]}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}

const SKILL_OPTIONS: { value: SkillAccuracy; label: string; icon: React.ReactNode }[] = [
  { value: 'too-high', label: 'Rated Too High', icon: <TrendingDown className="w-4 h-4" /> },
  { value: 'accurate', label: 'Accurate',        icon: <CheckCircle  className="w-4 h-4" /> },
  { value: 'too-low',  label: 'Rated Too Low',   icon: <TrendingUp   className="w-4 h-4" /> },
];

const RELIABILITY_OPTIONS: CategoryOption<Reliability>[] = [
  { value: 'punctual',       label: 'On time!',             sentiment: 'positive' },
  { value: 'mostly-on-time', label: 'A bit late',           sentiment: 'neutral'  },
  { value: 'often-late',     label: 'Late or no-show',      sentiment: 'negative' },
];

const SPORTSMANSHIP_OPTIONS: CategoryOption<Sportsmanship>[] = [
  { value: 'fair-play',     label: 'Fair & respectful',   sentiment: 'positive' },
  { value: 'average',       label: 'Nothing to note',     sentiment: 'neutral'  },
  { value: 'poor-attitude', label: 'Hot-headed or dirty', sentiment: 'negative' },
];

const VIBE_OPTIONS: CategoryOption<Vibe>[] = [
  { value: 'great', label: 'Friendly & fun!',        sentiment: 'positive' },
  { value: 'okay',  label: 'Fine, nothing special',  sentiment: 'neutral'  },
  { value: 'poor',  label: 'Unpleasant to play with',sentiment: 'negative' },
];

export default function ReviewPlayerScreen({
  reviewerId,
  reviewerName,
  reviewerAvatar,
  player,
  session,
  onBack,
  onSubmit,
}: ReviewPlayerScreenProps) {
  const [playAgain, setPlayAgain]         = useState<PlayAgain | null>(null);
  const [skillAccuracy, setSkillAccuracy] = useState<SkillAccuracy | null>(null);
  const [reliability, setReliability]     = useState<Reliability | null>(null);
  const [sportsmanship, setSportsmanship] = useState<Sportsmanship | null>(null);
  const [vibe, setVibe]                   = useState<Vibe | null>(null);
  const [feedback, setFeedback]           = useState('');
  const [isAnonymous, setIsAnonymous]     = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const canSubmit =
    playAgain !== null &&
    skillAccuracy !== null &&
    reliability !== null &&
    sportsmanship !== null &&
    vibe !== null &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit || !playAgain || !skillAccuracy || !reliability || !sportsmanship || !vibe) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitReview(
        reviewerId, player.id, session.id,
        playAgain, skillAccuracy,
        reliability, sportsmanship, vibe,
        feedback,
        isAnonymous,
        isAnonymous ? undefined : reviewerName,
        isAnonymous ? undefined : reviewerAvatar,
      );
      setSubmitted(true);
      timeoutRef.current = setTimeout(onSubmit, 1200);
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center gap-4 py-24 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary-fixed/15 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary-fixed" />
        </div>
        <div>
          <p className="font-black text-xl text-white">Review Submitted</p>
          <p className="text-sm text-on-surface-variant/50 mt-1">Thanks for reviewing {player.name}!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.2 }}
      className="space-y-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="font-black text-xl text-white tracking-tight">Review Player</h2>
      </div>

      {/* Player hero */}
      <div className="flex flex-col items-center gap-2 py-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-fixed/10 blur-xl scale-150" />
          <img
            src={player.avatar}
            alt={player.name}
            className="relative w-20 h-20 rounded-full object-cover border-2 border-primary-fixed/30"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary-fixed/20 ring-offset-2 ring-offset-background" />
        </div>
        <div className="text-center mt-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary-fixed/60">Reviewing</p>
          <p className="font-black text-2xl text-white">{player.name}</p>
          <p className="text-xs text-on-surface-variant/40 mt-0.5">
            {session.matchType === 'singles' ? 'Badminton Singles' : 'Badminton Doubles'} · {session.venue}
          </p>
        </div>
      </div>

      {/* Q1: Play again */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-black text-primary-fixed/50 tracking-widest pt-0.5">01</span>
          <div>
            <h3 className="font-bold text-sm text-white">Would you play with them again?</h3>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPlayAgain('yes')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer ${
              playAgain === 'yes'
                ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                : 'border-outline-variant/15 bg-surface-container/80 text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface-variant/80'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="font-bold text-sm">Yes, definitely!</span>
          </button>
          <button
            onClick={() => setPlayAgain('no')}
            className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all cursor-pointer ${
              playAgain === 'no'
                ? 'border-error bg-error/10 text-error'
                : 'border-outline-variant/15 bg-surface-container/80 text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface-variant/80'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-bold text-sm">Probably not</span>
          </button>
        </div>
      </section>

      {/* Q2: Skill accuracy */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-black text-primary-fixed/50 tracking-widest pt-0.5">02</span>
          <div>
            <h3 className="font-bold text-sm text-white">How accurate is their skill rating?</h3>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {SKILL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSkillAccuracy(opt.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                skillAccuracy === opt.value
                  ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                  : 'border-outline-variant/15 bg-surface-container/80 text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant/80'
              }`}
            >
              <span className="font-semibold text-sm">{opt.label}</span>
              <span className={skillAccuracy === opt.value ? 'text-primary-fixed' : 'text-on-surface-variant/30'}>
                {opt.icon}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Q3–Q5: Tap-to-select categories */}
      <CategoryPicker
        step="03" label="Punctuality"
        description="Were they punctual? Did they show up when they said they would?"
        options={RELIABILITY_OPTIONS}
        value={reliability}
        onChange={(v) => setReliability(v)}
      />
      <CategoryPicker
        step="04" label="Sportsmanship"
        description="How did they handle the game — wins, losses, and disputed calls?"
        options={SPORTSMANSHIP_OPTIONS}
        value={sportsmanship}
        onChange={(v) => setSportsmanship(v)}
      />
      <CategoryPicker
        step="05" label="Vibe & Friendliness"
        description="Were they friendly, fun to be around, and a good team player overall?"
        options={VIBE_OPTIONS}
        value={vibe}
        onChange={(v) => setVibe(v)}
      />

      {/* Optional free-text */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-white">
            Additional Comments <span className="text-on-surface-variant/35 font-normal text-xs">(optional)</span>
          </h3>
          <p className="text-xs text-on-surface-variant/45 mt-0.5">Leave a note the next player will see before playing with them.</p>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Solid backhand, communicates well, always brings extra shuttlecocks…"
          rows={3}
          className="w-full bg-surface-container/60 border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/25 resize-none outline-none focus:border-primary-fixed/40 transition-colors"
        />
      </section>

      {/* Identity toggle */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white">Show my name on this review</h3>
            <p className="text-xs text-on-surface-variant/45 mt-0.5">Off by default — your identity stays private</p>
          </div>
          <button
            role="switch"
            aria-checked={!isAnonymous}
            onClick={() => setIsAnonymous((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              !isAnonymous ? 'bg-primary-fixed' : 'bg-outline-variant/30'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                !isAnonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Attribution preview */}
        <div className="flex items-center gap-2.5 rounded-xl bg-surface-container/60 border border-outline-variant/10 px-3 py-2.5">
          {isAnonymous ? (
            <div className="w-7 h-7 rounded-full bg-outline-variant/20 flex items-center justify-center shrink-0">
              <span className="text-[11px] text-on-surface-variant/40 font-bold">?</span>
            </div>
          ) : (
            <img src={reviewerAvatar} alt={reviewerName} className="w-7 h-7 rounded-full object-cover shrink-0" />
          )}
          <span className="text-xs text-on-surface-variant/60 leading-snug">
            {isAnonymous
              ? 'Your review will appear anonymously'
              : <><span className="text-white font-semibold">{reviewerName}</span> · your review will show your name</>
            }
          </span>
        </div>
      </section>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-error text-center"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit — neon glow when all fields filled */}
      <motion.button
        onClick={handleSubmit}
        disabled={!canSubmit}
        animate={
          canSubmit
            ? { boxShadow: '0 0 28px 6px rgba(202,243,0,0.35)' }
            : { boxShadow: '0 0 0px 0px rgba(202,243,0,0)' }
        }
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
          canSubmit
            ? 'bg-primary-fixed text-on-primary-fixed cursor-pointer'
            : 'bg-surface-container text-on-surface-variant/30 cursor-not-allowed'
        }`}
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Submitting…' : 'Submit Review'}
      </motion.button>
    </motion.div>
  );
}
