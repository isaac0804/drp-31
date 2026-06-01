import { useState, FormEvent } from 'react';
import { UserProfile, SkillLevel } from '../types';
import { AVATARS } from '../data';
import { Trophy, User, Award } from 'lucide-react';

type SportOption = 'Badminton' | 'Table Tennis' | 'Football' | 'Pickleball';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  matchesPlayedCount: number;
}

export default function ProfileScreen({
  user,
  onUpdateProfile,
  matchesPlayedCount
}: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [skill, setSkill] = useState<SkillLevel>(user.skillLevel);
  const [about, setAbout] = useState(user.about ?? '');
  const [sportsPlayed, setSportsPlayed] = useState<SportOption[]>(user.sportsPlayed as SportOption[] ?? []);
  const [matchPreferences, setMatchPreferences] = useState(user.matchPreferences ?? '');
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  const availableSports: SportOption[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];

  const toggleSport = (sport: SportOption) => {
    setSportsPlayed((currentSports: SportOption[]) =>
      currentSports.includes(sport)
        ? currentSports.filter((currentSport) => currentSport !== sport)
        : [...currentSports, sport]
    );
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      avatar: selectedAvatar,
      skillLevel: skill,
      about,
      sportsPlayed,
      matchPreferences
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

      {/* Main Profile Layout form with stats column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Current card configuration */}
        <section className="md:col-span-1 bg-surface-container-high rounded-xl p-5 border border-outline-variant/15 flex flex-col items-center text-center gap-4 relative">
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
            <span className="inline-flex items-center px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold tracking-widest bg-primary-fixed/10 text-primary-fixed uppercase font-mono border border-primary-fixed/20">
              {skill}
            </span>
          </div>

          {/* User Quick Statistics */}
          <div className="w-full pt-4 border-t border-outline-variant/10 space-y-3">
            <div className="bg-surface-container-low rounded p-3 border border-outline-variant/5 text-center">
              <div className="text-lg font-bold text-white font-mono">{matchesPlayedCount}</div>
              <div className="text-[9px] text-on-surface-variant font-medium uppercase tracking-wider">
                Matches Played
              </div>
            </div>
          </div>
        </section>

        {/* Right Columns: Personalization parameters */}
        <form
          onSubmit={handleSave}
          className="md:col-span-2 bg-surface-container-high rounded-xl p-5 md:p-6 border border-outline-variant/15 space-y-5"
        >
          {/* Custom Name */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Athlete Name
            </label>
            <div className="relative rounded-lg bg-surface-variant/60 border border-outline-variant/40 flex items-center focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
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
          </div>

          {/* About Me */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              About Me
            </label>
            <div className="rounded-lg bg-surface-variant/60 border border-outline-variant/40 focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <textarea
                rows={5}
                placeholder="Tell others a little about your play style, goals, or what kind of matches you enjoy..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50 resize-none"
              />
            </div>
          </div>

          {/* Sports I Play */}
          <div className="space-y-2">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Sports I Play
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                        : 'border-outline-variant/40 bg-surface-variant/60 text-on-surface-variant hover:bg-surface-bright'
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
          </div>

          {/* Match Preferences */}
          <div className="space-y-1.5">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Match Preferences
            </label>
            <div className="rounded-lg bg-surface-variant/60 border border-outline-variant/40 focus-within:border-primary-fixed focus-within:ring-1 focus-within:ring-primary-fixed transition-all overflow-hidden">
              <textarea
                rows={4}
                placeholder="Describe the kind of matches you prefer, such as doubles or singles, casual or competitive, and other preferences..."
                value={matchPreferences}
                onChange={(e) => setMatchPreferences(e.target.value)}
                className="w-full bg-transparent text-on-surface font-sans text-sm p-3 outline-none border-none focus:ring-0 placeholder-on-surface-variant/50 resize-none"
              />
            </div>
          </div>

          {/* Avatar Option Switcher */}
          <div className="space-y-2">
            <label className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">
              Select Character Avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.url)}
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedAvatar === av.url ? 'border-primary-fixed scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    alt={av.name}
                    title={`${av.name} - ${av.role}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    src={av.url}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Submit Save Profile Button */}
          <div className="pt-2">
            <button
              type="submit"
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
          </div>
        </form>
      </div>
    </article>
  );
}
