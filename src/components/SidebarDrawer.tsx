import { X, Play, Trophy, Users, Award, Zap, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onSignOut: () => void;
  matchesCount: number;
}

export default function SidebarDrawer({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  onSignOut,
  matchesCount
}: SidebarDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 h-full w-80 bg-surface-container-high border-r border-outline-variant/30 text-on-surface z-50 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col">
                  <span className="font-sans font-extrabold text-2xl tracking-tighter italic text-primary-fixed uppercase">
                    PEER PLAY
                  </span>
                  <span className="text-xs text-on-surface-variant font-mono mt-0.5 tracking-wider">v1.2 // PRO LEAGUE</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-on-surface hover:bg-surface-variant/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links inside drawer */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate('explore');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-semibold text-sm uppercase tracking-wide ${
                    activeScreen === 'explore'
                      ? 'bg-primary-fixed text-on-primary-fixed shadow-[0_4px_12px_rgba(202,243,0,0.15)]'
                      : 'hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Explore Court Matches
                </button>

                <button
                  onClick={() => {
                    onNavigate('host');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-semibold text-sm uppercase tracking-wide ${
                    activeScreen === 'host'
                      ? 'bg-primary-fixed text-on-primary-fixed shadow-[0_4px_12px_rgba(202,243,0,0.15)]'
                      : 'hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Host Badminton Match
                </button>

                <button
                  onClick={() => {
                    onNavigate('sessions');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-semibold text-sm uppercase tracking-wide ${
                    activeScreen === 'sessions'
                      ? 'bg-primary-fixed text-on-primary-fixed shadow-[0_4px_12px_rgba(202,243,0,0.15)]'
                      : 'hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  My Managed Sessions
                </button>

                <button
                  onClick={() => {
                    onNavigate('profile');
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-semibold text-sm uppercase tracking-wide ${
                    activeScreen === 'profile'
                      ? 'bg-primary-fixed text-on-primary-fixed shadow-[0_4px_12px_rgba(202,243,0,0.15)]'
                      : 'hover:bg-surface-variant text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Athletic Profile
                </button>
              </div>

              {/* Live Statistics Panel */}
              <div className="mt-8 bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-fixed mb-3 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Arena Stats
                </h4>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-surface-container-high rounded-lg p-2.5">
                    <div className="text-xl font-bold font-mono text-on-surface">{matchesCount}</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-medium">Available Matches</div>
                  </div>
                  <div className="bg-surface-container-high rounded-lg p-2.5">
                    <div className="text-xl font-bold font-mono text-primary-fixed">15</div>
                    <div className="text-[10px] text-on-surface-variant uppercase font-medium">Local Arenas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="border-t border-outline-variant/20 pt-4 space-y-2">
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full text-xs text-on-surface-variant hover:text-on-surface flex items-center justify-center gap-2 py-2 border border-outline-variant/30 hover:border-outline-variant/60 rounded-lg transition-colors bg-black/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
              <div className="text-center text-[10px] text-on-surface-variant/40 mt-1 font-mono">
                Peer Play Inc. // All Rights Reserved
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
