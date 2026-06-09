import { HostReview } from '../types';
import { ArrowLeft, Star } from 'lucide-react';

interface HostReviewsScreenProps {
  playerName: string;
  reviews: HostReview[];
  onBack: () => void;
}

const SESSION_ORGANISATION_LABELS: Record<string, { label: string; color: string }> = {
  'well-organised': { label: 'Well organised',  color: 'text-emerald-400' },
  'average':        { label: 'Average',          color: 'text-amber-400'   },
  'disorganised':   { label: 'Disorganised',     color: 'text-red-400'     },
};

const VENUE_ACCURACY_LABELS: Record<string, { label: string; color: string }> = {
  'spot-on':           { label: 'Spot on',           color: 'text-emerald-400' },
  'minor-differences': { label: 'Minor differences', color: 'text-amber-400'   },
  'very-different':    { label: 'Very different',    color: 'text-red-400'     },
};

const WELCOMING_ATMOSPHERE_LABELS: Record<string, { label: string; color: string }> = {
  'very-welcoming': { label: 'Very welcoming', color: 'text-emerald-400' },
  'decent':         { label: 'Decent',         color: 'text-amber-400'   },
  'unwelcoming':    { label: 'Unwelcoming',    color: 'text-red-400'     },
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= rating ? 'text-primary-fixed fill-primary-fixed' : 'text-outline-variant/30'
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function HostReviewsScreen({ playerName, reviews, onBack }: HostReviewsScreenProps) {
  const totalStars = reviews.reduce((sum, r) => sum + r.starRating, 0);
  const avgRating = reviews.length > 0 ? totalStars / reviews.length : 0;

  const wellOrganisedCount = reviews.filter((r) => r.sessionOrganisation === 'well-organised').length;
  const spotOnVenueCount   = reviews.filter((r) => r.venueAccuracy === 'spot-on').length;
  const veryWelcomingCount = reviews.filter((r) => r.welcomingAtmosphere === 'very-welcoming').length;

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
            Host Reviews
          </div>
          <div className="w-10" />
        </div>
      </header>

      <div className="pt-20 space-y-6">
        <section className="space-y-2">
          <h2 className="font-sans font-black text-2xl text-white tracking-tight">{playerName}</h2>
          <div className="flex items-center gap-2">
            {reviews.length > 0 && <StarDisplay rating={Math.round(avgRating)} />}
            <p className="text-sm text-on-surface-variant/80">
              {reviews.length > 0
                ? <><span className="font-bold text-white">{avgRating.toFixed(1)}</span> · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} as host</>
                : 'No host reviews yet.'
              }
            </p>
          </div>
        </section>

        {reviews.length === 0 ? (
          <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant/15 text-center">
            <p className="text-sm text-on-surface-variant">No host reviews yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-emerald-400">{wellOrganisedCount}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Well Organised</div>
              </div>
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-emerald-400">{spotOnVenueCount}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Spot-on Venue</div>
              </div>
              <div className="bg-surface-container-high rounded-xl p-3 text-center border border-outline-variant/15">
                <div className="text-lg font-mono font-bold text-emerald-400">{veryWelcomingCount}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Very Welcoming</div>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((r, i) => {
                const org     = SESSION_ORGANISATION_LABELS[r.sessionOrganisation];
                const venue   = VENUE_ACCURACY_LABELS[r.venueAccuracy];
                const welcome = WELCOMING_ATMOSPHERE_LABELS[r.welcomingAtmosphere];
                return (
                  <div
                    key={r.id ?? i}
                    className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <StarDisplay rating={r.starRating} />
                      {r.createdAt > 0 && (
                        <span className="text-[10px] text-on-surface-variant/50">{formatDate(r.createdAt)}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-surface-container/60 rounded-lg p-2 text-center space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Organisation</p>
                        <p className={`text-[11px] font-semibold leading-tight ${org?.color ?? ''}`}>{org?.label ?? r.sessionOrganisation}</p>
                      </div>
                      <div className="bg-surface-container/60 rounded-lg p-2 text-center space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Venue</p>
                        <p className={`text-[11px] font-semibold leading-tight ${venue?.color ?? ''}`}>{venue?.label ?? r.venueAccuracy}</p>
                      </div>
                      <div className="bg-surface-container/60 rounded-lg p-2 text-center space-y-1">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant/50">Atmosphere</p>
                        <p className={`text-[11px] font-semibold leading-tight ${welcome?.color ?? ''}`}>{welcome?.label ?? r.welcomingAtmosphere}</p>
                      </div>
                    </div>

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
