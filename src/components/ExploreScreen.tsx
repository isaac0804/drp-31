import { useState, useMemo } from 'react';
import { MatchSession, SkillLevel, GenderPreference, Sport, UserGender, SKILL_LEVELS, SKILL_LEVEL_LABELS } from '../types';
import { SPORTS } from '../data';
import SkillRangePicker from './SkillRangePicker';
import { MapPin, Plus, CalendarDays, List, Map, SlidersHorizontal, X, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SessionMapView from './SessionMapView';

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'weekend' | 'custom';
export type TimeOfDayFilter = 'all' | 'morning' | 'afternoon' | 'evening';

export interface ExploreFilters {
  sport: 'all' | Sport;
  skillMin: SkillLevel;
  skillMax: SkillLevel;
  gender: 'all' | GenderPreference;
  hideFull: boolean;
  search: string;
  date: DateFilter;
  dateFrom: string;
  dateTo: string;
  timeOfDay: TimeOfDayFilter;
}

export const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  sport: 'all',
  skillMin: SKILL_LEVELS[0],
  skillMax: SKILL_LEVELS[SKILL_LEVELS.length - 1],
  gender: 'all',
  hideFull: false,
  search: '',
  date: 'all',
  dateFrom: '',
  dateTo: '',
  timeOfDay: 'all',
};

interface ExploreScreenProps {
  sessions: MatchSession[];
  onSelectSession: (id: string) => void;
  onNavigateToHost: () => void;
  currentUserId: string;
  viewMode: 'list' | 'map';
  onViewModeChange: (mode: 'list' | 'map') => void;
  filters: ExploreFilters;
  onFiltersChange: (f: ExploreFilters) => void;
  userGender?: UserGender;
  isDarkMode?: boolean;
  showAssessmentBanner?: boolean;
  onStartAssessment?: () => void;
}

export default function ExploreScreen({
  sessions,
  onSelectSession,
  onNavigateToHost,
  currentUserId,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  userGender,
  isDarkMode,
  showAssessmentBanner,
  onStartAssessment,
}: ExploreScreenProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { sport: selectedSport, skillMin: selectedSkillMin, skillMax: selectedSkillMax, gender: selectedGender, hideFull, search: searchQuery, date: selectedDate, dateFrom, dateTo, timeOfDay: selectedTimeOfDay } = filters;

  const skillRangeIsAll = selectedSkillMin === SKILL_LEVELS[0] && selectedSkillMax === SKILL_LEVELS[SKILL_LEVELS.length - 1];
  const activeFilterCount =
    (selectedSport !== 'all' ? 1 : 0) +
    (!skillRangeIsAll ? 1 : 0) +
    (selectedGender !== 'all' ? 1 : 0) +
    (hideFull ? 1 : 0) +
    (selectedDate !== 'all' ? 1 : 0) +
    (selectedTimeOfDay !== 'all' ? 1 : 0);

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
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const todayStr = fmtDate(now);
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = fmtDate(tomorrow);
    const dayOfWeek = now.getDay();
    const toSat = new Date(now); toSat.setDate(now.getDate() + ((6 - dayOfWeek + 7) % 7 || 7));
    const toSun = new Date(now); toSun.setDate(now.getDate() + ((0 - dayOfWeek + 7) % 7 || 7));
    const satStr = fmtDate(toSat);
    const sunStr = fmtDate(toSun);

    return sessions
      .filter((s) => {
        if (s.isPrivate) return false;
        if (!isUpcoming(s)) return false;
        if (hideFull && s.playersJoined.length >= s.maxPlayers) return false;
        const matchesSport = selectedSport === 'all' || s.sport === selectedSport;
        const matchesSkill = skillRangeIsAll || (() => {
          const sMinIdx = SKILL_LEVELS.indexOf(s.skillLevel);
          const sMaxIdx = SKILL_LEVELS.indexOf(s.skillLevelMax ?? s.skillLevel);
          const fMinIdx = SKILL_LEVELS.indexOf(selectedSkillMin);
          const fMaxIdx = SKILL_LEVELS.indexOf(selectedSkillMax);
          return sMinIdx <= fMaxIdx && sMaxIdx >= fMinIdx;
        })();
        const matchesGender = selectedGender === 'all' || (s.gender ?? 'open') === selectedGender;
        const matchesSearch =
          s.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.sport.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate =
          selectedDate === 'all' ? true :
          selectedDate === 'today' ? s.date === todayStr :
          selectedDate === 'tomorrow' ? s.date === tomorrowStr :
          selectedDate === 'weekend' ? (s.date === satStr || s.date === sunStr) :
          (!dateFrom || s.date >= dateFrom) && (!dateTo || s.date <= dateTo);
        const matchesTime =
          selectedTimeOfDay === 'all' ? true :
          selectedTimeOfDay === 'morning' ? s.timeStart < '12:00' :
          selectedTimeOfDay === 'afternoon' ? s.timeStart >= '12:00' && s.timeStart < '18:00' :
          s.timeStart >= '18:00';
        return matchesSport && matchesSkill && matchesGender && matchesSearch && matchesDate && matchesTime;
      })
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        return dateCmp !== 0 ? dateCmp : a.timeStart.localeCompare(b.timeStart);
      });
  }, [sessions, selectedSkillMin, selectedSkillMax, selectedGender, searchQuery, selectedSport, hideFull, skillRangeIsAll, selectedDate, dateFrom, dateTo, selectedTimeOfDay]);

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
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          placeholder="Search venue, sport, host..."
          value={searchQuery}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
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

      {/* Sport quick-filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {([{ value: 'all' as const, label: 'All Sports' }, ...SPORTS.map((s) => ({ value: s, label: s }))] as { value: 'all' | Sport; label: string }[]).map((chip) => (
          <button
            key={chip.value}
            onClick={() => onFiltersChange({ ...filters, sport: selectedSport === chip.value && chip.value !== 'all' ? 'all' : chip.value })}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              selectedSport === chip.value
                ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                : 'border-outline-variant/30 bg-surface-container/80 text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant/90'
            }`}
          >
            {chip.label}
          </button>
        ))}
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
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-high rounded-t-2xl max-h-[82vh] flex flex-col max-w-3xl mx-auto"
          >
            {/* Fixed header */}
            <div className="px-5 pt-5 shrink-0">
              <div className="w-10 h-1 rounded-full bg-outline-variant/50 mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans font-black text-lg text-on-surface">Filter Sessions</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 pb-4">

            <div className="space-y-2.5 mb-5">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Sport</p>
              <div className="grid grid-cols-2 gap-2">
                {([{ value: 'all', label: 'All Sports' }, ...SPORTS.map((s) => ({ value: s, label: s }))] as { value: 'all' | Sport; label: string }[]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onFiltersChange({ ...filters, sport: f.value })}
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

            <div className="h-px bg-outline-variant/20 mb-5" />
            <div className="space-y-2.5 mb-5">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Date
              </p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { value: 'today',    label: 'Today' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                  { value: 'weekend',  label: 'Weekend' },
                  { value: 'custom',   label: 'Range' },
                ] as { value: DateFilter; label: string }[]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onFiltersChange({ ...filters, date: selectedDate === f.value ? 'all' : f.value, ...(f.value !== 'custom' ? { dateFrom: '', dateTo: '' } : {}) })}
                    className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      selectedDate === f.value
                        ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                        : 'border-outline-variant/40 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              {selectedDate === 'custom' && (
                <div className="flex gap-2 items-center mt-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-on-surface-variant/50 font-semibold uppercase tracking-wider mb-1">From</p>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                      className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-fixed/60 transition-colors cursor-pointer"
                    />
                  </div>
                  <span className="text-on-surface-variant/40 mt-5">—</span>
                  <div className="flex-1">
                    <p className="text-[10px] text-on-surface-variant/50 font-semibold uppercase tracking-wider mb-1">To</p>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                      className="w-full bg-surface-variant border border-outline-variant/40 rounded-xl px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-fixed/60 transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="h-px bg-outline-variant/20 mb-5" />
            <div className="space-y-2.5 mb-5">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Time of Day
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'morning',   label: 'Morning', sub: 'Before 12pm' },
                  { value: 'afternoon', label: 'Afternoon', sub: '12pm – 6pm' },
                  { value: 'evening',   label: 'Evening', sub: 'After 6pm' },
                ] as { value: TimeOfDayFilter; label: string; sub: string }[]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onFiltersChange({ ...filters, timeOfDay: selectedTimeOfDay === f.value ? 'all' : f.value })}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      selectedTimeOfDay === f.value
                        ? 'border-primary-fixed bg-primary-fixed/10 text-primary-fixed'
                        : 'border-outline-variant/40 bg-surface-variant text-on-surface-variant hover:bg-surface-bright'
                    }`}
                  >
                    {f.label}
                    <span className={`text-[9px] font-normal normal-case tracking-normal ${selectedTimeOfDay === f.value ? 'text-primary-fixed/70' : 'text-on-surface-variant/50'}`}>{f.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-outline-variant/20 mb-5" />
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Skill Level</p>
                <span className="font-mono text-[10px] text-primary-fixed">
                  {skillRangeIsAll ? 'All Levels' : selectedSkillMin === selectedSkillMax ? SKILL_LEVEL_LABELS[selectedSkillMin] : `${SKILL_LEVEL_LABELS[selectedSkillMin]} – ${SKILL_LEVEL_LABELS[selectedSkillMax]}`}
                </span>
              </div>
              <div className="px-3">
                <SkillRangePicker
                  min={selectedSkillMin}
                  max={selectedSkillMax}
                  onChange={(min, max) => onFiltersChange({ ...filters, skillMin: min, skillMax: max })}
                />
              </div>
            </div>

            <div className="h-px bg-outline-variant/20 mb-5" />
            <div className="space-y-2.5 mb-5">
              <p className="font-sans font-extrabold text-[11px] text-on-surface uppercase tracking-wider">Gender</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'open',   label: 'Open to All' },
                  { value: 'male',   label: 'Male Only' },
                  { value: 'female', label: 'Female Only' },
                ] as { value: GenderPreference; label: string }[]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => onFiltersChange({ ...filters, gender: selectedGender === f.value ? 'all' : f.value })}
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

            <div className="h-px bg-outline-variant/20 mb-5" />
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, hideFull: !filters.hideFull })}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all cursor-pointer mb-6 bg-surface-variant/30 hover:bg-surface-bright border-outline-variant/40"
            >
              <span className="font-sans font-semibold text-sm text-on-surface uppercase tracking-wide">Hide full sessions</span>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${hideFull ? 'bg-primary-fixed' : 'bg-outline-variant/50'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${hideFull ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            </div>{/* end scrollable body */}

            {/* Fixed footer */}
            <div className="px-5 pb-8 pt-3 shrink-0 border-t border-outline-variant/15">
              <div className="flex gap-3">
                <button
                  onClick={() => onFiltersChange(DEFAULT_EXPLORE_FILTERS)}
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
            isDarkMode={isDarkMode}
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

      {showAssessmentBanner && onStartAssessment && (
        <div className="flex items-center gap-3 bg-primary-fixed/15 border border-primary-fixed/40 rounded-xl p-4">
          <div className="w-9 h-9 rounded-full bg-primary-fixed/20 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-primary-fixed" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-on-surface">What's your skill level?</p>
            <p className="text-xs text-on-surface-variant/80 mt-0.5">Take a quick assessment to find the right sessions for you.</p>
          </div>
          <button
            onClick={onStartAssessment}
            className="shrink-0 text-xs font-black uppercase tracking-wider text-on-primary-fixed bg-primary-fixed px-4 py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors cursor-pointer"
          >
            Start
          </button>
        </div>
      )}

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
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 ${
                        isFull ? 'border-outline-variant/40' : 'border-primary-fixed group-hover:scale-105 transition-transform'
                      }`}
                    >
                      <img
                        alt={session.host.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        src={session.host.avatar}
                      />
                    </div>
                    <span className="text-[10px] text-on-surface-variant/70 font-medium max-w-[80px] text-right truncate">
                      {session.host.name}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-container-highest text-on-surface-variant uppercase font-sans border border-outline-variant/20">
                      {session.sport}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border border-primary-fixed/30 bg-primary-fixed/5 text-primary-fixed uppercase font-sans">
                      {(() => {
                        const safeLabel = (l: string) => SKILL_LEVEL_LABELS[l as SkillLevel] ?? l;
                        const isAll = session.skillLevel === SKILL_LEVELS[0] &&
                          (session.skillLevelMax ?? session.skillLevel) === SKILL_LEVELS[SKILL_LEVELS.length - 1];
                        if (isAll) return 'All Levels';
                        return session.skillLevelMax && session.skillLevelMax !== session.skillLevel
                          ? `${safeLabel(session.skillLevel)} – ${safeLabel(session.skillLevelMax)}`
                          : safeLabel(session.skillLevel);
                      })()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-surface-variant text-on-surface-variant uppercase font-sans">
                      {session.sport === 'Football' && session.footballFormat ? session.footballFormat : session.matchType}
                    </span>
                    {(() => {
                      const genderIneligible = session.gender && session.gender !== 'open' && userGender !== session.gender;
                      return (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase font-sans ${
                          genderIneligible
                            ? 'bg-error/10 text-error border border-error/25'
                            : 'bg-surface-variant text-on-surface-variant'
                        }`}>
                          {session.gender === 'male' ? '♂ Male' : session.gender === 'female' ? '♀ Female' : '⚥ Open'}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5 min-w-[90px]">
                    <span className="font-sans font-extrabold text-[11px] text-on-surface tracking-wide">
                      {isFull ? (
                        <span className="text-error font-black uppercase tracking-widest">FULL</span>
                      ) : (
                        `${spotsFilled}/${maxPlayers} Players`
                      )}
                    </span>
                    {(() => {
                      const multi = maxPlayers > 10;
                      const rowSize = multi ? Math.ceil(maxPlayers / 2) : maxPlayers;
                      const rows = multi
                        ? [Array.from({ length: rowSize }), Array.from({ length: maxPlayers - rowSize })]
                        : [Array.from({ length: maxPlayers })];
                      return (
                        <div className={`flex flex-col gap-1 ${multi ? 'items-end' : ''}`}>
                          {rows.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex gap-1">
                              {row.map((_, i) => {
                                const stepIdx = rowIdx * rowSize + i;
                                return (
                                  <div
                                    key={stepIdx}
                                    className={`${multi ? 'w-4' : 'w-6'} h-1.5 rounded-full transition-colors ${
                                      stepIdx < spotsFilled
                                        ? isFull ? 'bg-outline/50' : 'bg-primary-fixed'
                                        : 'bg-surface-variant/90'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
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
