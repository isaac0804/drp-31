import { useEffect, useRef, useState } from 'react';
import { Player, MatchSession, SessionOrganisation, VenueAccuracy, WelcomingAtmosphere } from '../types';
import { ArrowLeft, Star, Send, CheckCircle, Check, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { submitHostReview } from '../reviews';

interface ReviewHostScreenProps {
  reviewerId: string;
  host: Player;
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

const SESSION_ORGANISATION_OPTIONS: CategoryOption<SessionOrganisation>[] = [
  { value: 'well-organised', label: 'Well organised',  sentiment: 'positive' },
  { value: 'average',        label: 'Average',         sentiment: 'neutral'  },
  { value: 'disorganised',   label: 'Disorganised',    sentiment: 'negative' },
];

const VENUE_ACCURACY_OPTIONS: CategoryOption<VenueAccuracy>[] = [
  { value: 'spot-on',           label: 'Spot on',          sentiment: 'positive' },
  { value: 'minor-differences', label: 'Minor differences', sentiment: 'neutral'  },
  { value: 'very-different',    label: 'Very different',   sentiment: 'negative' },
];

const WELCOMING_ATMOSPHERE_OPTIONS: CategoryOption<WelcomingAtmosphere>[] = [
  { value: 'very-welcoming', label: 'Very welcoming', sentiment: 'positive' },
  { value: 'decent',         label: 'Decent',         sentiment: 'neutral'  },
  { value: 'unwelcoming',    label: 'Unwelcoming',    sentiment: 'negative' },
];

export default function ReviewHostScreen({
  reviewerId,
  host,
  session,
  onBack,
  onSubmit,
}: ReviewHostScreenProps) {
  const [starRating, setStarRating]                       = useState<number>(0);
  const [hoveredStar, setHoveredStar]                     = useState<number>(0);
  const [sessionOrganisation, setSessionOrganisation]     = useState<SessionOrganisation | null>(null);
  const [venueAccuracy, setVenueAccuracy]                 = useState<VenueAccuracy | null>(null);
  const [welcomingAtmosphere, setWelcomingAtmosphere]     = useState<WelcomingAtmosphere | null>(null);
  const [feedback, setFeedback]                           = useState('');
  const [submitting, setSubmitting]                       = useState(false);
  const [submitted, setSubmitted]                         = useState(false);
  const [error, setError]                                 = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const canSubmit =
    starRating > 0 &&
    sessionOrganisation !== null &&
    venueAccuracy !== null &&
    welcomingAtmosphere !== null &&
    !submitting;

  async function handleSubmit() {
    if (!canSubmit || !sessionOrganisation || !venueAccuracy || !welcomingAtmosphere) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitHostReview(
        reviewerId,
        host.id,
        session.id,
        starRating,
        sessionOrganisation,
        venueAccuracy,
        welcomingAtmosphere,
        feedback.trim() || undefined,
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
          <p className="text-sm text-on-surface-variant/50 mt-1">Thanks for reviewing {host.name} as a host!</p>
        </div>
      </motion.div>
    );
  }

  const displayRating = hoveredStar || starRating;

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
        <h2 className="font-black text-xl text-white tracking-tight">Review Host</h2>
      </div>

      {/* Host hero */}
      <div className="flex flex-col items-center gap-2 py-5">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary-fixed/10 blur-xl scale-150" />
          <img
            src={host.avatar}
            alt={host.name}
            className="relative w-20 h-20 rounded-full object-cover border-2 border-primary-fixed/30"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary-fixed/20 ring-offset-2 ring-offset-background" />
        </div>
        <div className="text-center mt-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary-fixed/60">Reviewing Host</p>
          <p className="font-black text-2xl text-white">{host.name}</p>
          <p className="text-xs text-on-surface-variant/40 mt-0.5">
            {session.sport}{session.matchType !== 'singles' ? ' Doubles' : ' Singles'} · {session.venue}
          </p>
        </div>
      </div>

      {/* Star rating */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <span className="text-[10px] font-black text-primary-fixed/50 tracking-widest pt-0.5">00</span>
          <div>
            <h3 className="font-bold text-sm text-white">Overall host rating</h3>
            <p className="text-xs text-on-surface-variant/45 mt-0.5">How would you rate this host overall?</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStarRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              <Star
                className={`w-9 h-9 transition-colors ${
                  star <= displayRating
                    ? 'text-primary-fixed fill-primary-fixed'
                    : 'text-outline-variant/30'
                }`}
              />
            </button>
          ))}
        </div>
        {starRating > 0 && (
          <p className="text-center text-xs font-semibold text-primary-fixed/70">
            {starRating === 1 ? 'Poor' : starRating === 2 ? 'Below average' : starRating === 3 ? 'Average' : starRating === 4 ? 'Good' : 'Excellent'}
          </p>
        )}
      </section>

      {/* Q1–Q3 */}
      <CategoryPicker
        step="01" label="Session Organisation"
        description="How well did the host organise the session? Timings, communication, setup."
        options={SESSION_ORGANISATION_OPTIONS}
        value={sessionOrganisation}
        onChange={(v) => setSessionOrganisation(v)}
      />
      <CategoryPicker
        step="02" label="Venue Accuracy"
        description="Did the venue match what was described — location, facilities, courts?"
        options={VENUE_ACCURACY_OPTIONS}
        value={venueAccuracy}
        onChange={(v) => setVenueAccuracy(v)}
      />
      <CategoryPicker
        step="03" label="Welcoming Atmosphere"
        description="Did the host create a welcoming and inclusive environment for all players?"
        options={WELCOMING_ATMOSPHERE_OPTIONS}
        value={welcomingAtmosphere}
        onChange={(v) => setWelcomingAtmosphere(v)}
      />

      {/* Optional free-text */}
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container/40 p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-white">
            Additional Comments <span className="text-on-surface-variant/35 font-normal text-xs">(optional)</span>
          </h3>
          <p className="text-xs text-on-surface-variant/45 mt-0.5">Share anything else about your experience with this host.</p>
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="e.g. Great host, very communicative and the venue was exactly as described…"
          rows={3}
          className="w-full bg-surface-container/60 border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/25 resize-none outline-none focus:border-primary-fixed/40 transition-colors"
        />
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
        {submitting ? 'Submitting…' : 'Submit Host Review'}
      </motion.button>
    </motion.div>
  );
}
