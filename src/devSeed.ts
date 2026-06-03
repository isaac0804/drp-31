// Dev-only helper to seed a batch of varied dummy sessions hosted by the
// signed-in user. Because Firestore rules require auth, this must run inside an
// authenticated browser session — it is wired to `window.seedDummySessions()`
// in main.tsx when running the dev server. Re-running is safe: ids are stable
// (`dummy_seed_N`) so a second run overwrites rather than duplicates, and
// `window.unseedDummySessions()` removes them all.
import { postSession, cancelSession } from './sessions';
import { AVATARS } from './data';
import { MatchSession, Player, SessionLocation } from './types';

const VENUES: SessionLocation[] = [
  { name: 'Ethos Sport – Imperial College', address: 'Princes Gardens, London SW7 2AZ', lat: 51.4988, lng: -0.1765 },
  { name: 'Queen Mother Sports Centre', address: '223 Vauxhall Bridge Rd, London SW1V 1EL', lat: 51.4931, lng: -0.1412 },
  { name: 'Chelsea Sports Centre', address: 'Chelsea Manor St, London SW3 5PL', lat: 51.4837, lng: -0.1742 },
  { name: 'Westway Sports & Fitness', address: '1 Crowthorne Rd, London W10 6RP', lat: 51.5180, lng: -0.2183 },
  { name: 'Kensington Leisure Centre', address: 'Walmer Rd, London W11 4PH', lat: 51.5079, lng: -0.2038 },
  { name: 'Sobell Leisure Centre', address: 'Hornsey Rd, London N7 7NY', lat: 51.5526, lng: -0.1110 },
  { name: 'Finsbury Leisure Centre', address: 'Norman St, London EC1V 3PU', lat: 51.5266, lng: -0.0986 },
  { name: 'Battersea Park Millennium Arena', address: 'Battersea Park, London SW11 4NJ', lat: 51.4791, lng: -0.1567 },
];

// Player pool (everyone except the host) used to fill joined slots.
const POOL: Player[] = AVATARS.map((a) => ({ id: a.id, name: a.name, avatar: a.url }));

// YYYY-MM-DD for `today + offsetDays`.
function dateFromNow(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Spec {
  dayOffset: number; // days from today (≥7 = next week, ≤31 = within next month)
  timeStart: string;
  timeEnd: string;
  venue: number; // index into VENUES
  sport: MatchSession['sport'];
  skillLevel: MatchSession['skillLevel'];
  matchType: MatchSession['matchType'];
  gender: MatchSession['gender'];
  maxPlayers: number;
  fill: number; // extra players to add from POOL (host always counts as 1)
  isPrivate?: boolean;
  hostNote: string;
}

// Hand-tuned for spread across sport / skill / format / gender / privacy / fill.
const SPECS: Spec[] = [
  { dayOffset: 7,  timeStart: '18:30', timeEnd: '20:30', venue: 0, sport: 'Badminton',    skillLevel: 'intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 1, hostNote: 'Casual intermediate doubles at Ethos. Booked Court 2 — shuttles on me, just bring a racket.' },
  { dayOffset: 8,  timeStart: '07:30', timeEnd: '08:30', venue: 1, sport: 'Table Tennis',  skillLevel: 'beginner',     matchType: 'singles', gender: 'open',   maxPlayers: 2,  fill: 0, hostNote: 'Early-bird table tennis singles before work. Total beginners very welcome!' },
  { dayOffset: 10, timeStart: '19:00', timeEnd: '21:00', venue: 3, sport: 'Badminton',     skillLevel: 'pro',          matchType: 'doubles', gender: 'male',   maxPlayers: 4,  fill: 3, hostNote: 'Fast, hard-hitting pro-level men\'s doubles at Westway. Proper scoring, no warm-up babysitting.' },
  { dayOffset: 12, timeStart: '11:00', timeEnd: '13:00', venue: 7, sport: 'Football',      skillLevel: 'intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 10, fill: 5, hostNote: '5-a-side kickabout at Battersea. Mixed ability, just turn up for a run-around and some goals.' },
  { dayOffset: 13, timeStart: '20:00', timeEnd: '22:00', venue: 4, sport: 'Pickleball',    skillLevel: 'intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 2, hostNote: 'Pickleball doubles at Kensington. Rallies over score — friendly but competitive.' },
  { dayOffset: 15, timeStart: '18:00', timeEnd: '19:30', venue: 2, sport: 'Badminton',     skillLevel: 'beginner',     matchType: 'singles', gender: 'female', maxPlayers: 2,  fill: 0, hostNote: 'Beginner-friendly women\'s singles at Chelsea. Learning the basics together — no pressure.' },
  { dayOffset: 17, timeStart: '19:30', timeEnd: '21:30', venue: 5, sport: 'Table Tennis',  skillLevel: 'advanced',     matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 3, hostNote: 'Advanced table tennis doubles at Sobell. Spin-heavy, quick points — bring your A-game.' },
  { dayOffset: 19, timeStart: '21:00', timeEnd: '22:00', venue: 6, sport: 'Pickleball',    skillLevel: 'advanced',     matchType: 'singles', gender: 'open',   maxPlayers: 2,  fill: 0, isPrivate: true, hostNote: 'Private advanced pickleball singles — invite only, hitting hard before the weekend league.' },
  { dayOffset: 21, timeStart: '10:00', timeEnd: '12:00', venue: 0, sport: 'Badminton',     skillLevel: 'intermediate', matchType: 'doubles', gender: 'female', maxPlayers: 4,  fill: 2, hostNote: 'Weekend women\'s doubles at Ethos. Social, supportive, and a good sweat. Coffee after!' },
  { dayOffset: 23, timeStart: '18:00', timeEnd: '20:00', venue: 3, sport: 'Football',      skillLevel: 'intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 8,  fill: 4, hostNote: '4-a-side at Westway astro. Mixed team, rolling subs, all welcome for a proper game.' },
  { dayOffset: 26, timeStart: '20:30', timeEnd: '21:30', venue: 1, sport: 'Table Tennis',  skillLevel: 'pro',          matchType: 'singles', gender: 'open',   maxPlayers: 2,  fill: 1, isPrivate: true, hostNote: 'Private pro-level table tennis singles. Match-practice intensity — best of 7.' },
  { dayOffset: 28, timeStart: '17:30', timeEnd: '19:00', venue: 4, sport: 'Pickleball',    skillLevel: 'beginner',     matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 1, hostNote: 'First-timers pickleball doubles at Kensington. I\'ll run through the rules — paddles provided.' },
  { dayOffset: 30, timeStart: '19:00', timeEnd: '21:00', venue: 2, sport: 'Badminton',     skillLevel: 'advanced',     matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 2, hostNote: 'End-of-month advanced doubles at Chelsea. Long rallies, fast hands — let\'s finish the month strong.' },
];

function buildSession(spec: Spec, index: number, host: Player): MatchSession {
  const venue = VENUES[spec.venue];
  // Host is always the first joined player; top up with the pool (skipping the
  // host's own id), capped at maxPlayers.
  const joined: Player[] = [host];
  for (const p of POOL) {
    if (joined.length >= spec.maxPlayers) break;
    if (p.id === host.id) continue;
    if (joined.length - 1 >= spec.fill) break;
    joined.push(p);
  }
  return {
    id: `dummy_seed_${index + 1}`,
    date: dateFromNow(spec.dayOffset),
    timeStart: spec.timeStart,
    timeEnd: spec.timeEnd,
    venue: venue.name,
    address: venue.address,
    sport: spec.sport,
    location: venue,
    skillLevel: spec.skillLevel,
    matchType: spec.matchType,
    gender: spec.gender,
    maxPlayers: spec.maxPlayers,
    host,
    playersJoined: joined,
    hostNote: spec.hostNote,
    ...(spec.isPrivate ? { isPrivate: true } : {}),
  };
}

export async function seedDummySessions(host: Player): Promise<number> {
  if (!host?.id) throw new Error('seedDummySessions: no signed-in host available');
  const sessions = SPECS.map((spec, i) => buildSession(spec, i, host));
  await Promise.all(sessions.map((s) => postSession(s)));
  console.info(`[devSeed] Posted ${sessions.length} dummy sessions hosted by ${host.name} (${host.id}).`);
  return sessions.length;
}

export async function unseedDummySessions(): Promise<number> {
  await Promise.all(SPECS.map((_, i) => cancelSession(`dummy_seed_${i + 1}`)));
  console.info(`[devSeed] Removed ${SPECS.length} dummy sessions.`);
  return SPECS.length;
}
