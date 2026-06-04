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

export interface Review {
  id?: string;
  reviewerId: string;
  revieweeId: string;
  sessionId: string;
  playAgain: PlayAgain;
  skillAccuracy: SkillAccuracy;
  feedback: string;
  createdAt: number;
}
export type MatchType = 'singles' | 'doubles';
export type GenderPreference = 'male' | 'female' | 'open';

export interface SportSkill {
  skillLevel: SkillLevel;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
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
  gender?: GenderPreference;
  maxPlayers: number; // 2 for singles, 4 for doubles (or user specified)
  host: Player;
  playersJoined: Player[];
  hostNote: string;
  isPrivate?: boolean;
}
