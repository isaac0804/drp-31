import { useState, useMemo } from 'react';
import { MatchSession, SkillLevel, GenderPreference, Sport } from '../types';
import { SPORTS } from '../data';
import { MapPin, Plus, CalendarDays, List, Map, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SessionMapView from './SessionMapView';

interface ExploreScreenProps {
  sessions: MatchSession[];
  onSelectSession: (id: string) => void;
  onNavigateToHost: () => void;
  currentUserId: string;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
}

export default function ExploreScreen({
  sessions,
  onSelectSession,
  onNavigateToHost,
  currentUserId,
  viewMode,
  onViewModeChange,
}: ExploreScreenProps) {
  const [selectedSport, setSelectedSport] = useState<'all' | Sport>('all');
  const [selectedSkill, setSelectedSkill] = useState<'all' | SkillLevel>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | GenderPreference>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = (selectedSport !== 'all' ? 1 : 0) + (selectedSkill !== 'all' ? 1 : 0) + (selectedGender !== 'all' ? 1 : 0);

  // Filter out past sessions
  const isUpcoming = (s: MatchSession) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (s.date > todayStr) return true;
    if (s.date < todayStr) return false;
    const [endH, endM] = s.timeEnd.split(':').map(Number);
    return endH > today.getHours() || (endH === today.getHours() && endM > today.getMinutes());
  };

  // Handle filtering
  const filteredSessions = useMemo(() => {
    return sessions
      .filter((s) => {
        if (s.isPrivate) return false;
        if (!isUpcoming(s)) return false;
        const matchesSport = selectedSport === 'all' || s.sport === selectedSport;
        const matchesSkill = selectedSkill === 'all' || s.skillLevel === selectedSkill;
        const matchesGender = selectedGender === 'all' || (s.gender ?? 'open') === selectedGender;
        const matchesSearch =
          s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.host.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSport && matchesSkill && matchesGender && matchesSearch;
      })
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        return dateCmp !== 0 ? dateCmp : a.timeStart.localeCompare(b.timeStart);
      });
  }, [sessions, selectedSkill, selectedGender, searchQuery, selectedSport]);

  // Calendar formatter helper
  const getParsedDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const monthIdx = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const date = new Date(year, monthIdx, day);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        month: months[date.getMonth()] || 'Oct',
        day: day.toString(),
        weekDay: weekDays[date.getDay()],
      };
    }
    return { month: 'Oct', day: '24', weekDay: 'Mon' };
  };

  // Shared controls bar (search + filter + toggle) — used in both layouts
  const controlsBar = (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Search venue, club, or host..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 min-w-0 bg-surface-container-high/90 backdrop-blur-sm border border-outline-variant/30 text-on-surface text-sm rounded-xl py-3 px-4 outline-none focus:ring-1 focus:ring-primary-fixed/80 placeholder-on-surface-variant/50 transition-all font-sans"
      />

      <button
        onClick={() => setIsFilterOpen(true)}
        aria-label="Open filters"
        className={`relative p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 backdrop-blur-sm ${
          activeFilterCount > 0
            ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
            : 'border-outline-variant/40 bg-surface-container/90 text-on-surface-variant hover:bg-surface-bright'
        }`}
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-fixed text-on-primary-fixed text-[9px] font-black flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      <div className="flex rounded-xl border border-outline-variant/40 overflow-hidden shrink-0">
        <button
          onClick={() => onViewModeChange('list')}
          aria-pressed={viewMode === 'list'}
          className={`p-2.5 transition-colors cursor-pointer ${
            viewMode === 'list'
              ? 'bg-primary-fixed text-on-primary-fixed'
              : 'bg-surface-container/90 text-on-surface-variant hover:bg-surface-bright backdrop-blur-sm'
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('map')}
          aria-pressed={viewMode === 'map'}
          className={`p-2.5 transition-colors cursor-pointer ${
            viewMode === 'map'
              ? 'bg-primary-fixed text-on-primary-fixed'
              : 'bg-surface-container/90 text-on-surface-variant hover:bg-surface-bright backdrop-blur-sm'
          }`}
        >
          <Map className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Shared filter bottom sheet
  const filterSheet = (
    <AnimatePresence>
      {isFilterOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsFilterOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high rounded-t-2xl px-5 pt-5 pb-10 max-w-3xl mx-auto"
          >
            <div className="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto mb-5" />
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans font-black text-lg text-on-surface">Filter Sessions</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 mb-6">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Sport</p>
              <div className="grid grid-cols-2 gap-2">
                {([{ value: 'all', label: 'All Sports' }, ...SPORTS.map((s) => ({ value: s, label: s }))] as { value: 'all' | Sport; label: string }[]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedSport(f.value)}
                    className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      selectedSport === f.value
                        ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                        : 'border-outline-variant/40 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Skill Level</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'all', label: 'All Levels' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                  { value: 'pro', label: 'Pro' },
                ] as const).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedSkill(f.value)}
                    className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      selectedSkill === f.value
                        ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                        : 'border-outline-variant/40 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 mb-8">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Gender</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'all', label: 'Any Gender' },
                  { value: 'male', label: 'Male Only' },
                  { value: 'female', label: 'Female Only' },
                  { value: 'open', label: 'Open to All' },
                ] as const).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSelectedGender(f.value)}
                    className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      selectedGender === f.value
                        ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                        : 'border-outline-variant/40 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedSport('all'); setSelectedSkill('all'); setSelectedGender('all'); }}
                className="flex-1 py-3 rounded-full border border-outline-variant/50 text-on-surface-variant text-sm font-bold uppercase tracking-wider transition-all hover:bg-surface-variant cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 rounded-full bg-primary-fixed text-on-primary-fixed text-sm font-extrabold uppercase tracking-wider transition-all hover:bg-primary-fixed-dim active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // FAB — shared, always fixed
  const fab = (
    <button
      onClick={onNavigateToHost}
      aria-label="Host a Badminton Match"
      className="fixed bottom-24 right-5 md:right-8 md:bottom-8 w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(202,243,0,0.3)] hover:scale-105 active:scale-95 hover:rotate-90 transition-all duration-300 z-40 group cursor-pointer"
    >
      <Plus className="w-7 h-7 stroke-[3px]" />
    </button>
  );

  // ── Full-screen map layout ───────────────────────────────────────────────
  if (viewMode === 'map') {
    return (
      <>
        {/* Map fills the entire viewport, sits under header + bottom nav */}
        <div className="fixed inset-0 z-[10]">
          <SessionMapView
            sessions={filteredSessions}
            onSelectSession={onSelectSession}
            currentUserId={currentUserId}
            fullScreen
          />
        </div>

        {/* Controls bar floats just below the header */}
        <div className="fixed top-20 inset-x-0 z-[30] px-4 pt-3 pointer-events-none">
          <div className="max-w-3xl mx-auto pointer-events-auto">
            {controlsBar}
          </div>
        </div>

        {filterSheet}
        {fab}
      </>
    );
  }

  // ── List layout ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {controlsBar}
      {filterSheet}

      <section className="flex flex-col gap-4">
        {filteredSessions.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant/20 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-variant/30 flex items-center justify-center text-on-surface-variant/70">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-base text-on-surface">No Matches Found</h3>
            <p className="text-xs text-on-surface-variant/80 max-w-sm">
              No sessions match your current filters. Try adjusting your search or be the first to host one!
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
            const { month, day, weekDay } = getParsedDate(session.date);
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
                {isHostedByMe && (
                  <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed text-[9px] font-bold px-2 py-0.5 rounded-bl uppercase tracking-wider">
                    My Session
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-14 rounded-lg bg-surface-container-lowest flex flex-col items-center justify-center border border-outline-variant/20 shrink-0 gap-0.5">
                      <span className="font-sans font-extrabold text-[10px] text-primary-fixed uppercase tracking-wider">
                        {weekDay}
                      </span>
                      <span className="font-mono font-black text-lg text-on-surface leading-none">
                        {day}
                      </span>
                      <span className="font-sans font-semibold text-[9px] text-on-surface-variant uppercase tracking-wider">
                        {month}
                      </span>
                    </div>
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

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-container-highest text-on-surface-variant uppercase font-sans border border-outline-variant/20">
                      {session.sport}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-primary-fixed/30 bg-primary-fixed/5 text-primary-fixed uppercase font-sans">
                      {session.skillLevel}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-variant text-on-surface-variant uppercase font-sans">
                      {session.sport === 'Football' && session.footballFormat ? session.footballFormat : session.matchType}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-variant text-on-surface-variant uppercase font-sans">
                      {session.gender === 'male' ? '♂ Male' : session.gender === 'female' ? '♀ Female' : '⚥ Open'}
                    </span>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 min-w-[90px]">
                    <span className="font-sans font-extrabold text-[11px] text-on-surface tracking-wide">
                      {isFull ? (
                        <span className="text-error font-black uppercase tracking-widest">FULL</span>
                      ) : (
                        `${spotsFilled}/${maxPlayers} Players`
                      )}
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: maxPlayers }).map((_, stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`w-6 h-1.5 rounded-full transition-colors ${
                            stepIdx < spotsFilled
                              ? isFull ? 'bg-outline/50' : 'bg-primary-fixed'
                              : 'bg-surface-variant/90'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </section>

      {fab}
    </div>
  );
}
