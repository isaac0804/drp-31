export type SkillLevel = 'beginner' | 'lower-intermediate' | 'upper-intermediate' | 'advanced' | 'pro';
export const SKILL_LEVELS: SkillLevel[] = ['beginner', 'lower-intermediate', 'upper-intermediate', 'advanced', 'pro'];
export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  'beginner': 'Beginner',
  'lower-intermediate': 'Lower Int.',
  'upper-intermediate': 'Upper Int.',
  'advanced': 'Advanced',
  'pro': 'Pro',
};
export type Sport = 'Badminton' | 'Table Tennis' | 'Football' | 'Pickleball';
export type PlayAgain = 'yes' | 'no';
export type SkillAccuracy = 'too-high' | 'accurate' | 'too-low';
export type Reliability = 'punctual' | 'mostly-on-time' | 'often-late';
export type Sportsmanship = 'fair-play' | 'average' | 'poor-attitude';
export type Vibe = 'great' | 'okay' | 'poor';

export interface Review {
  id?: string;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  playAgain: PlayAgain;
  skillAccuracy: SkillAccuracy;
  reliability?: Reliability;
  sportsmanship?: Sportsmanship;
  vibe?: Vibe;
  feedback: string;
  createdAt: number;
}
export type ActiveScreen = 'explore' | 'host' | 'sessions' | 'details' | 'profile' | 'player-profile' | 'assessment' | 'reviews';
export type MatchType = 'singles' | 'doubles';
export type FootballFormat = '5v5' | '7v7' | '11v11';
export type GenderPreference = 'male' | 'female' | 'open';
export type UserGender = 'male' | 'female' | 'non-binary';
export const GENDER_LABELS: Record<UserGender, string> = {
  'male': '♂ Male',
  'female': '♀ Female',
  'non-binary': '⚧ Non-binary',
};

export interface SportSkill {
  skillLevel: SkillLevel;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  gender?: UserGender;
  skillLevel: SkillLevel;
  skillsBySport?: Partial<Record<Sport, SportSkill>>;
  about?: string;
  sportsPlayed?: string[];
  matchPreferences?: string;
  sportingHistory?: string;
  industry?: string;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  skillLevel?: SkillLevel;
}

export interface SessionLocation {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export interface MatchSession {
  id: string;
  date: string; // "YYYY-MM-DD" style
  timeStart: string; // "HH:MM" 24 hour
  timeEnd: string; // "HH:MM" 24 hour
  venue: string;
  address: string;
  sport: Sport;
  location?: SessionLocation;
  skillLevel: SkillLevel;       // minimum required level (range start)
  skillLevelMax?: SkillLevel;   // maximum accepted level (range end); defaults to skillLevel
  matchType: MatchType;
  footballFormat?: FootballFormat; // For football sessions: '5v5', '7v7', or '11v11'
  gender?: GenderPreference;
  maxPlayers: number; // 2 for singles, 4 for doubles (or user specified)
  host: Player;
  playersJoined: Player[];
  hostNote: string;
  isPrivate?: boolean;
  hostJoinsAsPlayer?: boolean;
}
