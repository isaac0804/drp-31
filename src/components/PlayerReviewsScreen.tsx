import { Review } from '../types';
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface PlayerReviewsScreenProps {
  playerName: string;
  reviews: Review[];
  onBack: () => void;
}

const SKILL_ACCURACY_LABELS: Record<string, { label: string; color: string }> = {
  'accurate': { label: 'Accurate', color: 'text-emerald-400' },
  'too-high': { label: 'Too High', color: 'text-amber-400' },
  'too-low': { label: 'Too Low', color: 'text-sky-400' },
};

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function PlayerReviewsScreen({ playerName, reviews, onBack }: PlayerReviewsScreenProps) {
  const playAgainYes = reviews.filter((r) => r.playAgain === 'yes').length;
  const accurateCount = reviews.filter((r) => r.skillAccuracy === 'accurate').length;
  const tooHighCount = reviews.filter((r) => r.skillAccuracy === 'too-high').length;
  const tooLowCount = reviews.filter((r) => r.skillAccuracy === 'too-low').length;

  return (
    <article className="pb-16">
      <header className="fixed top-0 left-0 w-full z-45 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="text-on-surface hover:bg-surface-variant/50 p-2 rounded-full transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-sans font-extrabold text-sm md:text-base uppercase tracking-widest text-primary-fixed">
            Peer Reviews
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="pt-20 space-y-6">
        <section className="space-y-1">
          <h2 className="font-sans font-black text-2xl text-white tracking-tight">{playerName}</h2>
          <p className="text-sm text-on-surface-variant/80">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from other players</p>
        </section>

        {reviews.length === 0 ? (
          <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/15 text-center">
            <p className="text-sm text-on-surface-variant">No reviews yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-primary-fixed">{playAgainYes}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Would Play Again</div>
              </div>
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-emerald-400">{accurateCount}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Skill Accurate</div>
              </div>
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-on-surface">{reviews.length - playAgainYes}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Would Not</div>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((r, i) => {
                const accuracy = SKILL_ACCURACY_LABELS[r.skillAccuracy];
                return (
                  <div
                    key={r.id ?? i}
                    className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {r.playAgain === 'yes' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-primary-fixed bg-primary-fixed/10 border border-primary-fixed/20 rounded-full px-2.5 py-0.5">
                            <ThumbsUp className="w-3 h-3" />
                            Would play again
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant bg-surface-container border border-outline-variant/20 rounded-full px-2.5 py-0.5">
                            <ThumbsDown className="w-3 h-3" />
                            Would not play again
                          </span>
                        )}
                      </div>
                      {r.createdAt > 0 && (
                        <span className="text-[10px] text-on-surface-variant/50">{formatDate(r.createdAt)}</span>
                      )}
                    </div>

                    {accuracy && (
                      <div className="flex items-center gap-1.5">
                        {r.skillAccuracy === 'accurate' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {r.skillAccuracy === 'too-high' && <ChevronUp className="w-3.5 h-3.5 text-amber-400" />}
                        {r.skillAccuracy === 'too-low' && <ChevronDown className="w-3.5 h-3.5 text-sky-400" />}
                        <span className={`text-[11px] font-semibold ${accuracy.color}`}>{accuracy.label} skill level</span>
                      </div>
                    )}

                    {r.feedback && r.feedback.trim() && (
                      <blockquote className="text-sm text-on-surface-variant bg-surface-container/60 border-l-2 border-primary-fixed/40 rounded-r-lg pl-3 pr-3 py-2 leading-relaxed italic">
                        "{r.feedback.trim()}"
                      </blockquote>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
