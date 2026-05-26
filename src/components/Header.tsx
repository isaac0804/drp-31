import { Menu } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onMenuClick: () => void;
  onProfileClick: () => void;
  onLogoClick: () => void;
}

export default function Header({ user, onMenuClick, onProfileClick, onLogoClick }: HeaderProps) {
  return (
    <header className="bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 fixed top-0 w-full z-45">
      <div className="flex justify-between items-center px-4 h-16 w-full max-w-7xl mx-auto">
        {/* Leading Hamburguer Icon */}
        <button
          onClick={onMenuClick}
          aria-label="Toggle Navigation Drawer"
          className="text-primary-fixed hover:bg-surface-variant/50 active:scale-95 transition-all p-2 -ml-2 rounded-full cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo Display */}
        <button
          onClick={onLogoClick}
          className="font-sans font-extrabold text-xl md:text-2xl tracking-tighter italic text-primary-fixed uppercase select-none cursor-pointer focus:outline-none flex items-center gap-1 hover:brightness-110 active:scale-98 transition-transform"
        >
          SMASHMATCH
        </button>

        {/* Profile Avatar Trigger Button */}
        <button
          onClick={onProfileClick}
          aria-label="View Athlete Profile"
          className="w-9 h-9 rounded-full border border-primary-fixed/30 overflow-hidden cursor-pointer active:scale-95 transition-all hover:border-primary-fixed relative group"
        >
          <img
            alt={user.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
            src={user.avatar}
          />
          <div className="absolute inset-0 bg-primary-fixed/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </header>
  );
}
