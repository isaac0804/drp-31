import { useState } from 'react';
import { Player, MatchSession } from '../types';
import { ArrowLeft, ThumbsUp, ThumbsDown, TrendingDown, CheckCircle, TrendingUp, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ReviewPlayerScreenProps {
  player: Player;
  session: MatchSession;
  onBack: () => void;
  onSubmit: () => void;
}

type PlayAgain = 'yes' | 'no' | null;
type SkillAccuracy = 'too-high' | 'accurate' | 'too-low' | null;

const SKILL_OPTIONS: { value: SkillAccuracy; label: string; icon: React.ReactNode }[] = [
  { value: 'too-high', label: 'Rated Too High', icon: <TrendingDown className="w-4 h-4" /> },
  { value: 'accurate', label: 'Accurate',        icon: <CheckCircle  className="w-4 h-4" /> },
  { value: 'too-low',  label: 'Rated Too Low',   icon: <TrendingUp   className="w-4 h-4" /> },
];

export default function ReviewPlayerScreen({
  player,
  session,
  onBack,
  onSubmit,
}: ReviewPlayerScreenProps) {
  const [playAgain, setPlayAgain] = useState<PlayAgain>(null);
  const [skillAccuracy, setSkillAccuracy] = useState<SkillAccuracy>(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = playAgain !== null && skillAccuracy !== null;

  function handleSubmit() {
    if (!canSubmit) return;
    setSubmitted(true);
    setTimeout(onSubmit, 1200);
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
      className="space-y-6 pb-8"
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
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="relative">
          <img
            src={player.avatar}
            alt={player.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-fixed/40"
          />
          <div className="absolute inset-0 rounded-full ring-2 ring-primary-fixed/20 ring-offset-2 ring-offset-background" />
        </div>
        <div className="text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary-fixed/70 mt-1">Reviewing</p>
          <p className="font-black text-2xl text-white">{player.name}</p>
          <p className="text-xs text-on-surface-variant/40 mt-0.5">
            {session.matchType === 'singles' ? 'Badminton Singles' : 'Badminton Doubles'} · {session.venue}
          </p>
        </div>
      </div>

      {/* Q1: Play again */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-white">Would you play with them again?</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPlayAgain('yes')}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all cursor-pointer ${
              playAgain === 'yes'
                ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                : 'border-outline-variant/20 bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-high'
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="font-bold text-sm">Yes</span>
          </button>
          <button
            onClick={() => setPlayAgain('no')}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all cursor-pointer ${
              playAgain === 'no'
                ? 'border-error bg-error/10 text-error'
                : 'border-outline-variant/20 bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-high'
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="font-bold text-sm">No</span>
          </button>
        </div>
      </section>

      {/* Q2: Skill accuracy */}
      <section className="space-y-3">
        <div>
          <h3 className="font-bold text-sm text-white">How accurate is their skill level?</h3>
          <p className="text-xs text-on-surface-variant/40 mt-0.5">
            Listed as <span className="text-primary-fixed capitalize">{session.skillLevel}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {SKILL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSkillAccuracy(opt.value)}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all cursor-pointer ${
                skillAccuracy === opt.value
                  ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                  : 'border-outline-variant/15 bg-surface-container text-on-surface-variant/70 hover:bg-surface-container-high'
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

      {/* Q3: Feedback */}
      <section className="space-y-3">
        <h3 className="font-bold text-sm text-white">Share your feedback <span className="text-on-surface-variant/40 font-normal">(optional)</span></h3>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Great opponent, solid backhand..."
          rows={3}
          className="w-full bg-surface-container border border-outline-variant/15 rounded-xl px-4 py-3 text-sm text-on-surface placeholder-on-surface-variant/30 resize-none outline-none focus:border-primary-fixed/40 transition-colors"
        />
      </section>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          canSubmit
            ? 'bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim cursor-pointer'
            : 'bg-surface-container text-on-surface-variant/30 cursor-not-allowed'
        }`}
      >
        <Send className="w-4 h-4" />
        Submit Review
      </button>
    </motion.div>
  );
}
