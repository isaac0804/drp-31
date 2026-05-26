import { Compass, Trophy, User } from 'lucide-react';

interface BottomNavProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  // Normalize screen details for navigation highlights (such as details screen maps back to explore)
  const getTabStyle = (tabName: string) => {
    const isActive = activeScreen === tabName || (tabName === 'explore' && activeScreen === 'details');
    return isActive
      ? 'bg-primary-container text-on-primary-container rounded-full px-5 py-1 transition-all active:scale-95 flex items-center gap-1.5'
      : 'text-on-surface-variant hover:text-primary-fixed transition-colors flex flex-col items-center justify-center';
  };

  return (
    <nav className="bg-surface-container-high/95 backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] fixed bottom-0 w-full z-45 rounded-t-xl flex justify-around items-center pt-2 pb-safe px-4 h-20 md:hidden">
      {/* Explore Tab */}
      <button
        onClick={() => onNavigate('explore')}
        className={`${getTabStyle('explore')} cursor-pointer`}
      >
        <Compass className={`w-5 h-5 ${activeScreen === 'explore' || activeScreen === 'details' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {(activeScreen === 'explore' || activeScreen === 'details') && (
          <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Explore</span>
        )}
        {!(activeScreen === 'explore' || activeScreen === 'details') && (
          <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Explore</span>
        )}
      </button>

      {/* Sessions Tab */}
      <button
        onClick={() => onNavigate('sessions')}
        className={`${getTabStyle('sessions')} cursor-pointer`}
      >
        <Trophy className={`w-5 h-5 ${activeScreen === 'sessions' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {activeScreen === 'sessions' && (
          <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Sessions</span>
        )}
        {activeScreen !== 'sessions' && (
          <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Sessions</span>
        )}
      </button>

      {/* Profile Tab */}
      <button
        onClick={() => onNavigate('profile')}
        className={`${getTabStyle('profile')} cursor-pointer`}
      >
        <User className={`w-5 h-5 ${activeScreen === 'profile' ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {activeScreen === 'profile' && (
          <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Profile</span>
        )}
        {activeScreen !== 'profile' && (
          <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Profile</span>
        )}
      </button>
    </nav>
  );
}
