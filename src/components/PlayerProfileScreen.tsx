import { Review, UserProfile, Sport, SportSkill, GENDER_LABELS } from '../types';
import { ArrowLeft, MessageSquare, ThumbsUp, Trophy, Target } from 'lucide-react';

interface PlayerProfileScreenProps {
  profile: UserProfile;
  matchesPlayedCount: number;
  reviews?: Review[];
  onBack: () => void;
  onViewReviews?: () => void;
}

function renderEmpty(value?: string) {
  return value && value.trim() ? value : 'Not shared yet.';
}

export default function PlayerProfileScreen({
  profile,
  matchesPlayedCount,
  reviews = [],
  onBack,
  onViewReviews,
}: PlayerProfileScreenProps) {
  const sportsPlayed = profile.sportsPlayed ?? [];

  const playAgainYes = reviews.filter((r) => r.playAgain === 'yes').length;
  const playAgainPct = reviews.length > 0 ? Math.round((playAgainYes / reviews.length) * 100) : null;
  const accurateCount = reviews.filter((r) => r.skillAccuracy === 'accurate').length;
  const tooHighCount = reviews.filter((r) => r.skillAccuracy === 'too-high').length;
  const tooLowCount = reviews.filter((r) => r.skillAccuracy === 'too-low').length;
  const feedbackItems = reviews.filter((r) => r.feedback && r.feedback.trim());

  return (
    <article className="space-y-6 pb-10">
      <header className="fixed top-0 left-0 w-full z-45 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30">
        <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="text-on-surface hover:bg-surface-variant/50 p-2 rounded-full transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="font-sans font-extrabold text-sm md:text-base uppercase tracking-widest text-primary-fixed">
            Player Profile
          </div>
          <div className="w-10" />
        </div>
      </header>

      <section className="space-y-1 pt-16">
        <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
          Athlete Profile
        </h2>
        <p className="text-sm text-on-surface-variant/80">
          View the profile details shared by this player.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 items-start">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary-fixed overflow-hidden relative">
              <img
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                src={profile.avatar}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary-fixed text-on-primary-fixed p-1.5 rounded-full shadow-lg">
              <Trophy className="w-4 h-4 stroke-[2.5px]" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="font-sans font-extrabold text-base text-on-surface">{profile.name}</h3>
            {profile.gender && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-highest border border-outline-variant/20 text-on-surface-variant">
                {GENDER_LABELS[profile.gender]}
              </span>
            )}
          </div>
        </div>

        {/* Per-sport skill ratings */}
        {(() => {
          const SPORTS: Sport[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];
          const assessed = SPORTS.filter((s) => profile.skillsBySport?.[s] != null);
          const unassessed = SPORTS.filter((s) => profile.skillsBySport?.[s] == null);
          if (assessed.length === 0 && !profile.skillLevel) return null;
          return (
            <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15 space-y-3">
              <h4 className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                Skill Ratings
              </h4>
              {assessed.length === 0 ? (
                <p className="text-sm text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
                  No assessments completed yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {assessed.map((sport) => {
                    const entry = profile.skillsBySport![sport] as SportSkill;
                    return (
                      <div
                        key={sport}
                        className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-3 space-y-1.5"
                      >
                        <p className="font-sans font-extrabold text-xs text-on-surface">{sport}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-primary-fixed/10 text-primary-fixed uppercase font-mono border border-primary-fixed/20">
                          {entry.skillLevel}
                        </span>
                      </div>
                    );
                  })}
                  {unassessed.map((sport) => (
                    <div
                      key={sport}
                      className="bg-surface-container-low/50 border border-dashed border-outline-variant/30 rounded-xl p-3 space-y-1.5"
                    >
                      <p className="font-sans font-extrabold text-xs text-on-surface-variant">{sport}</p>
                      <div className="flex items-center gap-1 text-on-surface-variant/40">
                        <Target className="w-3 h-3" />
                        <span className="font-mono text-[9px] uppercase tracking-wider">Not assessed</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        <section className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/15 text-center">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Matches Played
          </label>
          <div className="mt-3">
            <div className="text-lg font-bold text-on-surface font-mono">{matchesPlayedCount}</div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4">
          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              About Me
            </label>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
              {renderEmpty(profile.about)}
            </p>
          </section>

          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Sports I Play
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {sportsPlayed.length > 0 ? (
                sportsPlayed.map((sport) => (
                  <span
                    key={sport}
                    className="inline-flex items-center rounded-full border border-primary-fixed/30 bg-primary-fixed/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-fixed"
                  >
                    {sport}
                  </span>
                ))
              ) : (
                <p className="text-sm text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3 w-full">
                  Not shared yet.
                </p>
              )}
            </div>
          </section>

          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Match Preferences
            </label>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
              {renderEmpty(profile.matchPreferences)}
            </p>
          </section>

          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Sporting History
            </label>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
              {renderEmpty(profile.sportingHistory)}
            </p>
          </section>

          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Industry
            </label>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
              {renderEmpty(profile.industry)}
            </p>
          </section>

          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <button
              onClick={onViewReviews}
              disabled={!onViewReviews}
              className="w-full text-left"
            >
              <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                <MessageSquare className="w-3.5 h-3.5" />
                Peer Reviews
                {reviews.length > 0 && (
                  <span className="ml-1 font-mono text-primary-fixed">({reviews.length})</span>
                )}
                {onViewReviews && reviews.length > 0 && (
                  <span className="ml-auto text-[10px] text-primary-fixed font-bold uppercase tracking-wider">View all →</span>
                )}
              </label>
            </button>

            {reviews.length === 0 ? (
              <p className="mt-2 text-sm text-on-surface-variant bg-surface-container-high/60 border border-outline-variant/60 rounded-lg p-3">
                No reviews yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-surface-container rounded-lg p-3 text-center border border-outline-variant/20">
                    <div className="flex items-center justify-center gap-1 text-primary-fixed mb-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span className="font-mono font-bold text-base">{playAgainPct}%</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Would play again</p>
                    <p className="text-[10px] text-on-surface-variant/60 mt-0.5">{playAgainYes}/{reviews.length} players</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3 text-center border border-outline-variant/20">
                    <div className="font-mono font-bold text-base text-primary-fixed mb-1">{Math.round((accurateCount / reviews.length) * 100)}%</div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Skill accurate</p>
                    <div className="flex justify-center gap-1.5 mt-0.5">
                      {tooHighCount > 0 && <span className="text-[9px] text-amber-400">↑ too high</span>}
                      {tooLowCount > 0 && <span className="text-[9px] text-sky-400">↓ too low</span>}
                    </div>
                  </div>
                </div>

                {feedbackItems.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Comments</p>
                    {feedbackItems.map((r) => {
                      const attributed = !r.isAnonymous && r.reviewerName;
                      return (
                        <div
                          key={r.id}
                          className="bg-surface-container/60 border border-outline-variant/10 rounded-xl px-3 py-2.5 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            {attributed ? (
                              <img
                                src={r.reviewerAvatar}
                                alt={r.reviewerName}
                                className="w-6 h-6 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-outline-variant/20 flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-on-surface-variant/40 font-bold">?</span>
                              </div>
                            )}
                            <span className="text-[11px] font-semibold text-on-surface-variant">
                              {attributed ? r.reviewerName : 'Anonymous Player'}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed border-l-2 border-primary-fixed/40 pl-3">
                            {r.feedback}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

      </div>
    </article>
  );
}