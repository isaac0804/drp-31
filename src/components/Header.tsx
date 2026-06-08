import { useEffect, useRef, useState } from 'react';
import { Menu, User, Trophy, Star, Target, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen, UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onMenuClick: () => void;
  onLogoClick: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  onSignOut: () => void;
  pendingReviewCount?: number;
}

export default function Header({ user, onMenuClick, onLogoClick, onNavigate, onSignOut, pendingReviewCount = 0 }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const go = (screen: ActiveScreen) => {
    setOpen(false);
    onNavigate(screen);
  };

  const NAV_ITEMS: { screen: ActiveScreen; icon: React.ReactNode; label: string; badge?: number }[] = [
    { screen: 'profile',    icon: <User   className="w-4 h-4" />, label: 'Athletic Profile'  },
    { screen: 'sessions',   icon: <Trophy className="w-4 h-4" />, label: 'My Sessions'        },
    { screen: 'reviews',    icon: <Star   className="w-4 h-4" />, label: 'Player Reviews', badge: pendingReviewCount },
    { screen: 'assessment', icon: <Target className="w-4 h-4" />, label: 'Skill Assessment'  },
  ];

  return (
    <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 w-full z-45">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">

        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle Navigation Drawer"
          className="text-primary-fixed hover:bg-surface-variant/50 active:scale-95 transition-all p-2 -ml-2 rounded-full cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <button
          onClick={onLogoClick}
          className="font-sans font-extrabold text-xl md:text-2xl tracking-tighter italic text-primary-fixed uppercase select-none cursor-pointer focus:outline-none flex items-center gap-1 hover:brightness-110 active:scale-98 transition-transform"
        >
          PEER PLAY
        </button>

        {/* Avatar → popup trigger */}
        <div className="relative" ref={popupRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open profile menu"
            className="relative cursor-pointer active:scale-95 transition-all group"
          >
            <div className={`w-9 h-9 rounded-full border overflow-hidden ${
              open ? 'border-primary-fixed' : 'border-primary-fixed/30 group-hover:border-primary-fixed'
            } transition-all`}>
              <img
                alt={user.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
                src={user.avatar}
              />
              <div className="absolute inset-0 rounded-full bg-primary-fixed/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none shadow-sm">
                {pendingReviewCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 top-12 w-64 bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50"
              >
                {/* User info */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-outline-variant/20">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full border-2 border-primary-fixed/30 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white truncate">{user.name}</p>
                    {user.skillLevel && (
                      <p className="text-xs text-on-surface-variant/50 capitalize mt-0.5">{user.skillLevel}</p>
                    )}
                  </div>
                </div>

                {/* Nav links */}
                <div className="py-1.5">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.screen}
                      onClick={() => go(item.screen)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer text-left"
                    >
                      <span className="text-on-surface-variant/60">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Sign out */}
                <div className="border-t border-outline-variant/20 py-1.5">
                  <button
                    onClick={() => { setOpen(false); onSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-error/80 hover:bg-error/8 hover:text-error transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
