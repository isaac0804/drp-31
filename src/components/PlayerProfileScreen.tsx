import { UserProfile } from '../types';
import { ArrowLeft, Trophy } from 'lucide-react';

interface PlayerProfileScreenProps {
  profile: UserProfile;
  matchesPlayedCount: number;
  onBack: () => void;
}

function renderEmpty(value?: string) {
  return value && value.trim() ? value : 'Not shared yet.';
}

export default function PlayerProfileScreen({
  profile,
  matchesPlayedCount,
  onBack
}: PlayerProfileScreenProps) {
  const sportsPlayed = profile.sportsPlayed ?? [];

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

          <div>
            <h3 className="font-sans font-extrabold text-base text-on-surface">{profile.name}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold tracking-widest bg-primary-fixed/10 text-primary-fixed uppercase font-mono border border-primary-fixed/20">
              {profile.skillLevel}
            </span>
          </div>
        </div>

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
        </div>

      </div>
    </article>
  );
}