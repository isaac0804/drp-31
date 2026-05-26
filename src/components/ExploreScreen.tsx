import { useState, useMemo } from 'react';
import { MatchSession, SkillLevel } from '../types';
import { MapPin, Plus, ListFilter, Users, CalendarDays, Trash } from 'lucide-react';
import { motion } from 'motion/react';

interface ExploreScreenProps {
  sessions: MatchSession[];
  onSelectSession: (id: string) => void;
  onNavigateToHost: () => void;
  currentUserId: string;
}

export default function ExploreScreen({
  sessions,
  onSelectSession,
  onNavigateToHost,
  currentUserId
}: ExploreScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | SkillLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle filtering
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSkill = selectedFilter === 'all' || s.skillLevel === selectedFilter;
      const matchesSearch =
        s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.host.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSkill && matchesSearch;
    });
  }, [sessions, selectedFilter, searchQuery]);

  // Calendar formatter helper
  const getParsedDate = (dateStr: string) => {
    // "YYYY-MM-DD" -> parse
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const monthIdx = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const date = new Date(year, monthIdx, day);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        month: months[date.getMonth()] || 'Oct',
        day: day.toString()
      };
    }
    return { month: 'Oct', day: '24' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Quick Filters bar */}
      <div className="flex flex-col gap-3">
        {/* Search input to easily find arenas */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search venue, club, or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-high border border-outline-variant/30 text-on-surface text-sm rounded-xl py-3 pl-4 pr-10 outline-none focus:ring-1 focus:ring-primary-fixed/80 placeholder-on-surface-variant/50 transition-all font-sans"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
            <ListFilter className="w-4 h-4" />
          </span>
        </div>

        {/* Horizontal Filters Scroll */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {([
            { value: 'all', label: 'All Matches' },
            { value: 'beginner', label: 'Beginner' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'pro', label: 'Pro' }
          ] as const).map((filter) => {
            const isActive = selectedFilter === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary-fixed/50 hover:text-primary-fixed'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List Feed */}
      <section className="flex flex-col gap-4">
        {filteredSessions.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-variant/30 flex items-center justify-center text-on-surface-variant/70">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-base text-on-surface">No Matches Found</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-sm">
              We couldn't find any sessions matching "{selectedFilter}" level in this venue search. Be the first to host one!
            </p>
            <button
              onClick={onNavigateToHost}
              className="mt-2 bg-primary-fixed hover:bg-primary-fixed-dim text-on-primary-fixed text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Host A Match Now
            </button>
          </div>
        ) : (
          filteredSessions.map((session, index) => {
            const { month, day } = getParsedDate(session.date);
            const spotsFilled = session.playersJoined.length;
            const maxPlayers = session.maxPlayers;
            const isFull = spotsFilled >= maxPlayers;
            const isHostedByMe = session.host.id === currentUserId;

            return (
              <motion.article
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`bg-surface-container-high rounded-xl p-4 flex flex-col gap-4 border border-outline-variant/15 shadow-md relative overflow-hidden group hover:border-primary-fixed/45 transition-all duration-200 cursor-pointer ${
                  isFull ? 'opacity-70' : ''
                }`}
              >
                {/* Background active glow for user-owned sessions */}
                {isHostedByMe && (
                  <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wider">
                    My Session
                  </div>
                )}

                {/* Top Row: Date/Time Badge & Host Badge */}
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    {/* Date Block */}
                    <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex flex-col items-center justify-center border border-outline-variant/20 shrink-0">
                      <span className="font-sans font-extrabold text-[10px] text-on-surface-variant uppercase tracking-wider">
                        {month}
                      </span>
                      <span className="font-mono font-black text-lg text-primary-fixed leading-none">
                        {day}
                      </span>
                    </div>

                    {/* Venue & Time Information */}
                    <div>
                      <h3
                        className={`font-sans font-bold text-base leading-snug text-on-surface group-hover:text-primary-fixed transition-colors ${
                          isFull ? 'line-through decoration-on-surface-variant/60' : ''
                        }`}
                      >
                        {session.timeStart} - {session.timeEnd}
                      </h3>
                      <p className="font-sans text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-fixed shrink-0" />
                        <span className="truncate max-w-[190px] md:max-w-[400px]">
                          {session.venue}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Host Avatar Badge with status ring */}
                  <div
                    className={`w-9 h-9 rounded-full overflow-hidden shrink-0 border-2 ${
                      isFull ? 'border-outline-variant/40' : 'border-primary-fixed group-hover:scale-105 transition-transform'
                    }`}
                  >
                    <img
                      alt={session.host.name}
                      title={`Hosted by ${session.host.name}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      src={session.host.avatar}
                    />
                  </div>
                </div>

                {/* Bottom Row: Badges, Skill Level and Spots Progress Bar */}
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-outline-variant/10">
                  {/* Skill level and gameplay mode badge */}
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-primary-fixed/30 bg-primary-fixed/5 text-primary-fixed uppercase font-sans">
                      {session.skillLevel}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-variant text-on-surface-variant uppercase font-sans">
                      {session.matchType}
                    </span>
                  </div>

                  {/* Visual Stepper capacity display */}
                  <div className="text-right flex flex-col items-end gap-1.5 min-w-[90px]">
                    <span className="font-sans font-extrabold text-[11px] text-on-surface tracking-wide">
                      {isFull ? (
                        <span className="text-error font-black uppercase tracking-widest">FULL</span>
                      ) : (
                        `${spotsFilled}/${maxPlayers} Players`
                      )}
                    </span>
                    
                    {/* Progress Indicator Dots matching original screen visual */}
                    <div className="flex gap-1">
                      {Array.from({ length: maxPlayers }).map((_, stepIdx) => {
                        const isFilled = stepIdx < spotsFilled;
                        return (
                          <div
                            key={stepIdx}
                            className={`w-6 h-1.5 rounded-full transition-colors ${
                              isFilled
                                ? isFull
                                  ? 'bg-outline/50'
                                  : 'bg-primary-fixed'
                                : 'bg-surface-variant/90'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      {/* Floating Action Button for speedy creation flow */}
      <button
        onClick={onNavigateToHost}
        aria-label="Host a Badminton Match"
        className="fixed bottom-24 right-5 md:right-8 md:bottom-8 w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(202,243,0,0.3)] hover:scale-105 active:scale-95 hover:rotate-90 transition-all duration-300 z-40 group cursor-pointer"
      >
        <Plus className="w-7 h-7 stroke-[3px]" />
      </button>
    </div>
  );
}
