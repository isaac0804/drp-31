import { Compass, Trophy, User, Star, MessageCircle } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  pendingReviewCount?: number;
}

export default function BottomNav({ activeScreen, onNavigate, pendingReviewCount = 0 }: BottomNavProps) {
  const isActive = (tab: string) =>
    activeScreen === tab ||
    (tab === 'explore' && activeScreen === 'details') ||
    (tab === 'chats' && activeScreen === 'session-chat');

  const tabClass = (tab: string) =>
    isActive(tab)
      ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-all active:scale-95 flex items-center gap-1.5'
      : 'text-on-surface-variant hover:text-primary-fixed transition-colors flex flex-col items-center justify-center';

  return (
    <nav className="bg-surface-container-high/95 backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] fixed bottom-0 w-full z-45 rounded-t-xl flex justify-around items-center pt-2 pb-safe px-2 h-20 md:hidden">

      {/* Explore */}
      <button onClick={() => onNavigate('explore')} className={`${tabClass('explore')} cursor-pointer`}>
        <Compass className={`w-5 h-5 ${isActive('explore') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {isActive('explore')
          ? <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Explore</span>
          : <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Explore</span>
        }
      </button>

      {/* Sessions */}
      <button onClick={() => onNavigate('sessions')} className={`${tabClass('sessions')} cursor-pointer`}>
        <Trophy className={`w-5 h-5 ${isActive('sessions') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {isActive('sessions')
          ? <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Sessions</span>
          : <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Sessions</span>
        }
      </button>

      {/* Reviews */}
      <button onClick={() => onNavigate('reviews')} className={`${tabClass('reviews')} cursor-pointer relative`}>
        <div className="relative">
          <Star className={`w-5 h-5 ${isActive('reviews') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
          {pendingReviewCount > 0 && !isActive('reviews') && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
              {pendingReviewCount}
            </span>
          )}
        </div>
        {isActive('reviews')
          ? <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Reviews</span>
          : <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Reviews</span>
        }
      </button>

      {/* Chats */}
      <button onClick={() => onNavigate('chats')} className={`${tabClass('chats')} cursor-pointer`}>
        <MessageCircle className={`w-5 h-5 ${isActive('chats') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {isActive('chats')
          ? <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Chats</span>
          : <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Chats</span>
        }
      </button>

      {/* Profile */}
      <button onClick={() => onNavigate('profile')} className={`${tabClass('profile')} cursor-pointer`}>
        <User className={`w-5 h-5 ${isActive('profile') ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
        {isActive('profile')
          ? <span className="font-sans font-bold text-[11px] tracking-wide uppercase">Profile</span>
          : <span className="font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70 mt-0.5">Profile</span>
        }
      </button>

    </nav>
  );
}
