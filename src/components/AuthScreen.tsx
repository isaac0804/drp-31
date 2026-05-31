import { Trophy } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

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
                Peer Play Demo
              </p>
              <h1 className="font-sans font-black text-3xl md:text-4xl text-white tracking-tight leading-tight">
                Sign in to manage court sessions.
              </h1>
            </div>
            <p className="text-sm text-on-surface-variant/85 leading-relaxed">
              Sign in with your Google account to host matches, join sessions, and sync your profile across devices.
            </p>
          </div>

          <button
            type="button"
            onClick={onSignIn}
            className="w-full bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed font-sans font-extrabold text-sm uppercase tracking-widest py-4 px-6 rounded-full shadow-[0_4px_16px_rgba(202,243,0,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <GoogleIcon />
            Sign in with Google
          </button>

          {error && (
            <p className="rounded-2xl border border-error/40 bg-error-container/20 px-4 py-3 text-xs font-semibold text-error leading-relaxed">
              {error}
            </p>
          )}

          <div className="rounded-2xl bg-surface-container-low border border-outline-variant/10 p-4">
            <p className="text-[11px] text-on-surface-variant/75 font-medium leading-relaxed">
              Your profile and sessions are tied to your Google account and will sync across all your devices.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
