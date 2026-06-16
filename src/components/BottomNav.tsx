import { Compass, Trophy, User, Star, MessageCircle } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  pendingReviewCount?: number;
  unreadChatsCount?: number;
}

export default function BottomNav({ activeScreen, onNavigate, pendingReviewCount = 0, unreadChatsCount = 0 }: BottomNavProps) {
  const isActive = (tab: string) =>
    activeScreen === tab ||
    (tab === 'explore' && activeScreen === 'details') ||
    (tab === 'chats' && activeScreen === 'session-chat');

  const iconBoxClass = (tab: string) =>
    `flex items-center justify-center w-8 h-7 rounded-lg transition-all ${
      isActive(tab) ? 'bg-primary-fixed' : ''
    }`;

  const iconClass = (tab: string) =>
    `w-4.5 h-4.5 ${isActive(tab) ? 'text-on-primary-fixed stroke-[2.5px]' : 'text-on-surface-variant stroke-[2px]'}`;

  const labelClass = (tab: string) =>
    isActive(tab)
      ? 'font-sans font-bold text-[10px] tracking-wide uppercase text-primary-fixed'
      : 'font-sans font-semibold text-[10px] tracking-wide text-on-surface-variant/70';

  return (
    <nav className="bg-surface-container-high/95 backdrop-blur-md border-t border-outline-variant/20 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] fixed bottom-0 w-full z-45 rounded-t-xl flex justify-around items-center pt-1.5 pb-safe px-2 h-16 md:hidden">

      {/* Explore */}
      <button onClick={() => onNavigate('explore')} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all">
        <div className={iconBoxClass('explore')}>
          <Compass className={iconClass('explore')} />
        </div>
        <span className={labelClass('explore')}>Explore</span>
      </button>

      {/* Sessions */}
      <button onClick={() => onNavigate('sessions')} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all">
        <div className={iconBoxClass('sessions')}>
          <Trophy className={iconClass('sessions')} />
        </div>
        <span className={labelClass('sessions')}>Sessions</span>
      </button>

      {/* Reviews */}
      <button onClick={() => onNavigate('reviews')} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all">
        <div className={`relative ${iconBoxClass('reviews')}`}>
          <Star className={iconClass('reviews')} />
          {pendingReviewCount > 0 && !isActive('reviews') && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
              {pendingReviewCount}
            </span>
          )}
        </div>
        <span className={labelClass('reviews')}>Reviews</span>
      </button>

      {/* Chats */}
      <button onClick={() => onNavigate('chats')} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all">
        <div className={`relative ${iconBoxClass('chats')}`}>
          <MessageCircle className={iconClass('chats')} />
          {unreadChatsCount > 0 && !isActive('chats') && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
              {unreadChatsCount}
            </span>
          )}
        </div>
        <span className={labelClass('chats')}>Chats</span>
      </button>

      {/* Profile */}
      <button onClick={() => onNavigate('profile')} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95 transition-all">
        <div className={iconBoxClass('profile')}>
          <User className={iconClass('profile')} />
        </div>
        <span className={labelClass('profile')}>Profile</span>
      </button>

    </nav>
  );
}
