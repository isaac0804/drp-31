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
  { name: 'Ethos Sport – Imperial College', address: '7 Prince\'s Gardens, London SW7 1NA', lat: 51.4993, lng: -0.1756 },
  { name: 'Queen Mother Sports Centre', address: '223 Vauxhall Bridge Rd, London SW1V 1EL', lat: 51.4931, lng: -0.1412 },
  { name: 'Chelsea Sports Centre', address: 'Chelsea Manor St, London SW3 5PL', lat: 51.4837, lng: -0.1742 },
  { name: 'Westway Sports & Fitness', address: '1 Crowthorne Rd, London W10 6RP', lat: 51.5180, lng: -0.2183 },
  { name: 'Kensington Leisure Centre', address: 'Walmer Rd, London W11 4PH', lat: 51.5079, lng: -0.2038 },
  { name: 'Sobell Leisure Centre', address: 'Hornsey Rd, London N7 7NY', lat: 51.5526, lng: -0.1110 },
  { name: 'Finsbury Leisure Centre', address: 'Norman St, London EC1V 3PU', lat: 51.5266, lng: -0.0986 },
  { name: 'Battersea Park Millennium Arena', address: 'Battersea Park, London SW11 4NJ', lat: 51.4791, lng: -0.1567 },
];

// Player pool used to fill joined slots and act as hosts for non-user sessions.
// Indices: 0=Chloe, 1=Alex, 2=Sarah, 3=Marcus, 4=Jamie, 5=Elena
const POOL: Player[] = AVATARS.map((a) => ({ id: a.id, name: a.name, avatar: a.url }));

// YYYY-MM-DD for `today + offsetDays`.
function dateFromNow(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Spec {
  dayOffset: number;
  timeStart: string;
  timeEnd: string;
  venue: number;
  sport: MatchSession['sport'];
  skillLevel: MatchSession['skillLevel'];
  matchType: MatchSession['matchType'];
  gender: MatchSession['gender'];
  maxPlayers: number;
  fill: number;        // total players including host
  isPrivate?: boolean;
  hostNote: string;
  poolHost?: number;   // use POOL[poolHost] as host instead of the signed-in user
  includeUser?: boolean; // add the signed-in user to playersJoined (only when poolHost is set)
}

const SPECS: Spec[] = [
  // ── Past sessions hosted by the signed-in user (review demo) ──────────────
  // User hosts: Chloe + Alex + Sarah joined. Good for standard reviews.
  { dayOffset: -3, timeStart: '18:00', timeEnd: '20:00', venue: 0, sport: 'Badminton',   skillLevel: 'lower-intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 3, hostNote: 'Great session at Ethos — courts were in perfect condition. GGs all round!' },
  // User hosts: Chloe + Alex + Sarah joined. Sarah is the "bad player" for the review demo.
  { dayOffset: -1, timeStart: '19:30', timeEnd: '21:30', venue: 4, sport: 'Badminton',   skillLevel: 'lower-intermediate', matchType: 'doubles', gender: 'open',   maxPlayers: 4,  fill: 3, hostNote: 'Doubles at Kensington. Tight rallies, good fun overall.' },
];

function buildSession(spec: Spec, index: number, signedInUser: Player): MatchSession {
  const venue = VENUES[spec.venue];
  const host: Player = spec.poolHost !== undefined ? POOL[spec.poolHost] : signedInUser;

  const joined: Player[] = [host];

  // For pool-hosted sessions, optionally include the signed-in user as a participant
  if (spec.poolHost !== undefined && spec.includeUser) {
    joined.push(signedInUser);
  }

  // Fill remaining slots from POOL, skipping anyone already joined
  const target = 1 + spec.fill;
  for (const p of POOL) {
    if (joined.length >= Math.min(spec.maxPlayers, target)) break;
    if (joined.some((j) => j.id === p.id)) continue;
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
  console.info(`[devSeed] Posted ${sessions.length} dummy sessions (${host.name} as signed-in user).`);
  return sessions.length;
}

export async function unseedDummySessions(): Promise<number> {
  const SWEEP = 20; // covers any previously seeded range
  const results = await Promise.allSettled(
    Array.from({ length: SWEEP }, (_, i) => cancelSession(`dummy_seed_${i + 1}`))
  );
  const removed = results.filter((r) => r.status === 'fulfilled').length;
  console.info(`[devSeed] Cleaned up ${removed} dummy sessions.`);
  return removed;
}
