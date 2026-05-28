import { Trophy, UserCheck } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
  error?: string | null;
}

export default function AuthScreen({ onSignIn, error }: AuthScreenProps) {
  return (
    <main className="min-h-screen bg-background text-on-background flex items-center justify-center px-5 py-10 antialiased">
      <section className="w-full max-w-md bg-surface-container-high border border-outline-variant/20 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-primary-fixed/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 w-48 h-48 rounded-full bg-primary-fixed/5 blur-3xl" />

        <div className="relative space-y-7">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shadow-[0_8px_24px_rgba(202,243,0,0.25)]">
              <Trophy className="w-7 h-7 stroke-[2.5px]" />
            </div>
            <div>
              <p className="font-mono text-xs text-primary-fixed uppercase tracking-[0.25em] mb-2">
                SmashMatch Demo
              </p>
              <h1 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
                Sign in to manage court sessions.
              </h1>
            </div>
            <p className="text-sm text-on-surface-variant/85 leading-relaxed">
              Continue as the demo athlete to host matches, join sessions, and edit your profile with a single authenticated user.
            </p>
          </div>

          <button
            type="button"
            onClick={onSignIn}
            className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-sans font-extrabold text-sm uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_4px_16px_rgba(202,243,0,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserCheck className="w-5 h-5 stroke-[2.5px]" />
            Continue as Demo User
          </button>

          {error && (
            <p className="rounded-2xl border border-error/40 bg-error-container/20 px-4 py-3 text-xs font-semibold text-error leading-relaxed">
              {error}
            </p>
          )}

          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/10 p-4">
            <p className="text-[11px] text-on-surface-variant/75 font-medium leading-relaxed">
              This keeps authentication isolated so Firebase Auth can replace the demo user later without changing every screen.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
