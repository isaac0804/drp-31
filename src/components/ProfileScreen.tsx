import { useState, FormEvent } from 'react';
import { UserProfile } from '../types';
import { AVATARS } from '../data';
import { Trophy, User, Award, RotateCcw } from 'lucide-react';

interface ProfileScreenProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  matchesPlayedCount: number;
  onRetakeAssessment: () => void;
}

export default function ProfileScreen({
  user,
  onUpdateProfile,
  matchesPlayedCount,
  onRetakeAssessment,
}: ProfileScreenProps) {
  const [name, setName] = useState(user.name);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const skill = user.skillLevel;
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      avatar: selectedAvatar,
      skillLevel: skill
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-primary-fixed/10 text-primary-fixed uppercase font-mono border border-primary-fixed/20">
                {skill}
              </span>
              {user.skillScore != null && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-surface-container-highest text-on-surface-variant uppercase font-mono border border-outline-variant/20">
                  {user.skillScore} / 10
                </span>
              )}
            </div>
          </div>

          {/* User Quick Statistics */}
          <div className="w-full pt-4 border-t border-outline-variant/10 space-y-3">
            <h4 className="text-[10px] font-black uppercase text-on-surface-variant tracking-wider text-left">
              Smash Achievements
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-surface-container-low rounded p-2 border border-outline-variant/5">
                <div className="text-base font-bold text-white font-mono">{matchesPlayedCount}</div>
                <div className="text-[9px] text-on-surface-variant font-medium uppercase">Wins / Matches</div>
              </div>
              <div className="bg-surface-container-low rounded p-2 border border-outline-variant/5">
                <div className="text-base font-bold text-primary-fixed font-mono">100%</div>
                <div className="text-[9px] text-on-surface-variant font-medium uppercase">Fair Play Rat.</div>
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
          <div className="pt-2 space-y-2">
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
            <button
              type="button"
              onClick={onRetakeAssessment}
              className="w-full border border-outline-variant/50 bg-surface-variant/30 hover:bg-surface-bright text-on-surface-variant font-sans font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Skill Assessment
            </button>
          </div>
        </form>
      </div>
    </article>
  );
}
