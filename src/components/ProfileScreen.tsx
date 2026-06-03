import { useState, FormEvent } from 'react';
import { Review, UserProfile, Sport, SportSkill } from '../types';
import { MessageSquare, ThumbsUp, Trophy, User, Award, RotateCcw, Target } from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  matchesPlayedCount: number;
  onRetakeAssessment: () => void;
  reviews?: Review[];
}

export default function ProfileScreen({
  user,
  onUpdateProfile,
  matchesPlayedCount,
  onRetakeAssessment,
  reviews = [],
}: ProfileScreenProps) {
  const availableSports: Sport[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];
  const [name, setName] = useState(user.name);
  const selectedAvatar = user.avatar;
  const [about, setAbout] = useState(user.about ?? '');
  const [sportsPlayed, setSportsPlayed] = useState<Sport[]>(
    (user.sportsPlayed ?? []).filter((sport): sport is Sport =>
      availableSports.includes(sport as Sport)
    )
  );
  const [matchPreferences, setMatchPreferences] = useState(user.matchPreferences ?? '');
  const [sportingHistory, setSportingHistory] = useState(user.sportingHistory ?? '');
  const [industry, setIndustry] = useState(user.industry ?? '');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  const playAgainYes = reviews.filter((r) => r.playAgain === 'yes').length;
  const playAgainPct = reviews.length > 0 ? Math.round((playAgainYes / reviews.length) * 100) : null;
  const accurateCount = reviews.filter((r) => r.skillAccuracy === 'accurate').length;
  const tooHighCount = reviews.filter((r) => r.skillAccuracy === 'too-high').length;
  const tooLowCount = reviews.filter((r) => r.skillAccuracy === 'too-low').length;
  const feedbackItems = reviews.filter((r) => r.feedback && r.feedback.trim());

  const toggleSport = (sport: Sport) => {
    setSportsPlayed((currentSports: Sport[]) =>
      currentSports.includes(sport)
        ? currentSports.filter((currentSport) => currentSport !== sport)
        : [...currentSports, sport]
    );
  };

  const handleSave = (e?: FormEvent) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    onUpdateProfile({
      name,
      avatar: selectedAvatar,
      skillLevel: user.skillLevel,
      about,
      sportsPlayed,
      matchPreferences,
      sportingHistory,
      industry
    });
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 2500);
  };

  return (
    <article className="space-y-6">
      {/* Profile summary banner */}
      <section className="space-y-1">
        <h2 className="font-sans font-black text-2xl md:text-3xl text-white tracking-tight">
          Athletic Profile
        </h2>
        <p className="text-sm text-on-surface-variant/80">
          Personalize your athlete profile and configure default parameters.
        </p>
      </section>

      {/* Main Profile Layout: left summary stacked above form on all sizes */}
      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Profile image, name and skill (no section wrapper) */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-primary-fixed overflow-hidden relative">
              <img
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                src={selectedAvatar}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary-fixed text-on-primary-fixed p-1.5 rounded-full shadow-lg">
              <Trophy className="w-4 h-4 stroke-[2.5px]" />
            </div>
          </div>

          <div>
            <h3 className="font-sans font-extrabold text-base text-on-surface">{name || 'Guest Athlete'}</h3>
          </div>
        </div>

        {/* Per-sport skill ratings */}
        {(() => {
          const SPORTS: Sport[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];
          const assessed = SPORTS.filter((s) => user.skillsBySport?.[s] != null);
          const unassessed = SPORTS.filter((s) => user.skillsBySport?.[s] == null);
          if (assessed.length === 0) return null;
          return (
            <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15 space-y-3">
              <h4 className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                Skill Ratings
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {assessed.map((sport) => {
                  const entry = user.skillsBySport![sport] as SportSkill;
                  return (
                    <div
                      key={sport}
                      className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-3 space-y-1.5"
                    >
                      <p className="font-sans font-extrabold text-xs text-on-surface">{sport}</p>
                      <div className="flex items-end gap-1.5">
                        <span className="font-mono font-black text-2xl text-primary-fixed leading-none">
                          {entry.skillScore}
                        </span>
                        <span className="font-mono text-[10px] text-primary-fixed/60 mb-0.5">/ 10</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-widest bg-primary-fixed/10 text-primary-fixed uppercase font-mono border border-primary-fixed/20">
                        {entry.skillLevel}
                      </span>
                    </div>
                  );
                })}
                {unassessed.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={onRetakeAssessment}
                    className="bg-surface-container-low/50 border border-dashed border-outline-variant/30 rounded-xl p-3 text-left hover:border-primary-fixed/40 hover:bg-primary-fixed/5 transition-all cursor-pointer group space-y-1.5"
                  >
                    <p className="font-sans font-extrabold text-xs text-on-surface-variant group-hover:text-on-surface">
                      {sport}
                    </p>
                    <div className="flex items-center gap-1 text-on-surface-variant/50 group-hover:text-primary-fixed transition-colors">
                      <Target className="w-3 h-3" />
                      <span className="font-mono text-[9px] uppercase tracking-wider">Assess</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Matches Played - show count directly in grey container */}
        <section className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/15 text-center">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
            Matches Played
          </label>
          <div className="mt-3">
            <div className="text-lg font-bold text-on-surface font-mono">{matchesPlayedCount}</div>
          </div>
        </section>

        {/* Peer Reviews */}
        <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
          <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Peer Reviews
            {reviews.length > 0 && (
              <span className="ml-1 font-mono text-primary-fixed">({reviews.length})</span>
            )}
          </label>

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
                  <div className="font-mono font-bold text-base text-primary-fixed mb-1">{accurateCount}/{reviews.length}</div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Skill accurate</p>
                  <div className="flex justify-center gap-1.5 mt-0.5">
                    {tooHighCount > 0 && <span className="text-[9px] text-amber-400">{tooHighCount} too high</span>}
                    {tooLowCount > 0 && <span className="text-[9px] text-sky-400">{tooLowCount} too low</span>}
                  </div>
                </div>
              </div>

              {feedbackItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Comments</p>
                  {feedbackItems.map((r) => (
                    <blockquote
                      key={r.id}
                      className="text-sm text-on-surface-variant bg-surface-container/60 border-l-2 border-primary-fixed/40 rounded-r-lg pl-3 pr-3 py-2 leading-relaxed"
                    >
                      {r.feedback}
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Personalization parameters - form sections */}
        <div className="grid grid-cols-1 gap-4">
          {/* Athlete Name section */}
          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Athlete Name
            </label>
            <div className="mt-2 relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center transition-all overflow-hidden">
              <span className="pl-3 text-on-surface-variant shrink-0">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="Enter custom nickname..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50"
              />
            </div>
          </section>

          {/* About Me section */}
          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              About Me
            </label>
            <div className="mt-2">
                <textarea
                  rows={5}
                  placeholder="Tell others a little about your play style, goals, or what kind of matches you enjoy..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full bg-surface-container-high/60 text-on-surface font-sans text-sm p-3 outline-none border border-outline-variant/60 focus-within:ring-1 focus-within:ring-primary-fixed placeholder-on-surface-variant/50 resize-none rounded-lg"
                />
            </div>
          </section>

          {/* Sports I Play + Match Preferences section (stacked) */}
          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <div>
              <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                Sports I Play
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableSports.map((sport) => {
                  const isSelected = sportsPlayed.includes(sport);

                  return (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => toggleSport(sport)}
                      className={`rounded-lg border px-3 py-3 text-left transition-all ${
                        isSelected
                          ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                          : 'border-outline-variant/40 bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-bright'
                      }`}
                    >
                      <div className="font-sans text-sm font-bold">{sport}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider">
                        {isSelected ? 'Selected' : 'Tap to add'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                  Match Preferences
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Describe the kind of matches you prefer, such as doubles or singles, casual or competitive, and other preferences..."
                    value={matchPreferences}
                    onChange={(e) => setMatchPreferences(e.target.value)}
                    className="w-full bg-surface-container-high/60 text-on-surface font-sans text-sm p-3 outline-none border border-outline-variant/60 focus-within:ring-1 focus-within:ring-primary-fixed placeholder-on-surface-variant/50 resize-none rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sporting History + Industry section */}
          <section className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/15">
            <div className="space-y-3">
              <div>
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                  Sporting History
                </label>
                <div className="mt-2">
                  <textarea
                    rows={4}
                    placeholder="Share your playing background, competitive experience, or any notable events in your sporting journey..."
                    value={sportingHistory}
                    onChange={(e) => setSportingHistory(e.target.value)}
                    className="w-full bg-surface-container-high/60 text-on-surface font-sans text-sm p-3 outline-none border border-outline-variant/60 focus-within:ring-1 focus-within:ring-primary-fixed placeholder-on-surface-variant/50 resize-none rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
                  Industry
                </label>
                <div className="mt-2">
                  <textarea
                    rows={2}
                    placeholder="Type the industry you work in or are interested in..."
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-surface-container-high/60 text-on-surface font-sans text-sm p-3 outline-none border border-outline-variant/60 focus-within:ring-1 focus-within:ring-primary-fixed placeholder-on-surface-variant/50 resize-none rounded-lg"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Save Button - separate visual section */}
          <div className="bg-transparent">
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSave()}
                className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-sans font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-full shadow-[0_4px_12px_rgba(202,243,0,0.15)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Save Athletic Profile
              </button>
              {isSavedSuccessfully && (
                <p className="text-center text-xs text-primary-fixed mt-2 font-semibold">
                  ✓ Character profile saved and synchronized!
                </p>
              )}
              <button
                type="button"
                onClick={onRetakeAssessment}
                className="w-full border border-outline-variant/50 bg-surface-variant/30 hover:bg-surface-bright text-on-surface-variant font-sans font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retake Skill Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
